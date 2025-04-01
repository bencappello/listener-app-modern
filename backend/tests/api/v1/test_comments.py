import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User, Song, Band, Blog, Comment
from app.tests.utils.user import create_random_user
from app.tests.utils.song import create_random_song
from app.tests.utils.band import create_random_band
from app.tests.utils.blog import create_random_blog
from app.core.config import settings

pytestmark = pytest.mark.asyncio

async def test_create_comment_on_blog(async_client: AsyncClient, async_db_session: AsyncSession, user_token_headers: dict):
    user = await async_db_session.get(User, 2) # Assuming user with ID 2 exists from fixtures
    blog = create_random_blog(async_db_session) # Using sync version for now
    comment_data = {"content": "Test comment on blog", "blog_id": blog.id}
    
    response = await async_client.post(
        f"{settings.API_V1_STR}/comments/", 
        headers=user_token_headers, 
        json=comment_data
    )
    assert response.status_code == 200 # API returns 200 on create
    content = response.json()
    assert content["content"] == comment_data["content"]
    assert content["user_id"] == user.id
    assert content["blog_id"] == blog.id
    assert content["target_type"] == "blog"

# TODO: Add test_create_comment_on_song once API supports it
# TODO: Add test_create_comment_on_band once API supports it

async def test_create_comment_missing_target(async_client: AsyncClient, async_db_session: AsyncSession, user_token_headers: dict):
    comment_data = {"content": "Comment without target"}
    response = await async_client.post(
        f"{settings.API_V1_STR}/comments/", 
        headers=user_token_headers, 
        json=comment_data
    )
    # Expecting validation error from Pydantic schema or API logic
    assert response.status_code == 422 # Unprocessable Entity

async def test_create_comment_multiple_targets(async_client: AsyncClient, async_db_session: AsyncSession, user_token_headers: dict):
    blog = create_random_blog(async_db_session) 
    song = create_random_song(async_db_session) 
    comment_data = {"content": "Multi target", "blog_id": blog.id, "song_id": song.id}
    response = await async_client.post(
        f"{settings.API_V1_STR}/comments/", 
        headers=user_token_headers, 
        json=comment_data
    )
    # Expecting validation error from Pydantic schema
    assert response.status_code == 422

async def test_read_comments_by_blog(async_client: AsyncClient, async_db_session: AsyncSession, user_token_headers: dict):
    user = await async_db_session.get(User, 2)
    blog = create_random_blog(async_db_session)
    # Create comments
    comment1_in = {"content": "First comment", "blog_id": blog.id}
    await async_client.post(f"{settings.API_V1_STR}/comments/", headers=user_token_headers, json=comment1_in)
    comment2_in = {"content": "Second comment", "blog_id": blog.id}
    await async_client.post(f"{settings.API_V1_STR}/comments/", headers=user_token_headers, json=comment2_in)
    
    response = await async_client.get(
        f"{settings.API_V1_STR}/comments/by-target/blog/{blog.id}", 
        headers=user_token_headers
    )
    assert response.status_code == 200
    content = response.json()
    assert isinstance(content, list)
    assert len(content) >= 2
    assert content[0]["content"] == comment1_in["content"]
    assert content[1]["content"] == comment2_in["content"]
    assert all(c["blog_id"] == blog.id for c in content)
    
async def test_update_own_comment(async_client: AsyncClient, async_db_session: AsyncSession, user_token_headers: dict):
    user = await async_db_session.get(User, 2)
    blog = create_random_blog(async_db_session)
    comment_data = {"content": "Comment to update", "blog_id": blog.id}
    response_create = await async_client.post(f"{settings.API_V1_STR}/comments/", headers=user_token_headers, json=comment_data)
    comment_id = response_create.json()["id"]
    
    update_data = {"content": "Updated content"}
    response_update = await async_client.put(
        f"{settings.API_V1_STR}/comments/{comment_id}", 
        headers=user_token_headers, 
        json=update_data
    )
    assert response_update.status_code == 200
    content = response_update.json()
    assert content["content"] == update_data["content"]
    assert content["id"] == comment_id

async def test_update_other_user_comment(async_client: AsyncClient, async_db_session: AsyncSession, user_token_headers: dict, superuser_token_headers: dict):
    # Create comment as normal user
    user = await async_db_session.get(User, 2) 
    blog = create_random_blog(async_db_session)
    comment_data = {"content": "Another user comment", "blog_id": blog.id}
    response_create = await async_client.post(f"{settings.API_V1_STR}/comments/", headers=user_token_headers, json=comment_data)
    comment_id = response_create.json()["id"]

    # Try to update as superuser (should work)
    update_data = {"content": "Updated by admin"}
    response_update_admin = await async_client.put(
        f"{settings.API_V1_STR}/comments/{comment_id}", 
        headers=superuser_token_headers, 
        json=update_data
    )
    # Update the API logic - currently allows owner OR superuser
    assert response_update_admin.status_code == 200 
    assert response_update_admin.json()["content"] == update_data["content"]

    # Need another user fixture/creation to test forbidden update

async def test_delete_own_comment(async_client: AsyncClient, async_db_session: AsyncSession, user_token_headers: dict):
    user = await async_db_session.get(User, 2)
    blog = create_random_blog(async_db_session)
    comment_data = {"content": "Comment to delete", "blog_id": blog.id}
    response_create = await async_client.post(f"{settings.API_V1_STR}/comments/", headers=user_token_headers, json=comment_data)
    comment_id = response_create.json()["id"]

    response_delete = await async_client.delete(
        f"{settings.API_V1_STR}/comments/{comment_id}", 
        headers=user_token_headers
    )
    assert response_delete.status_code == 200 # API returns 200 on delete

    # Verify deletion
    response_get = await async_client.get(f"{settings.API_V1_STR}/comments/{comment_id}", headers=user_token_headers)
    assert response_get.status_code == 404

# TODO: Add test_delete_other_user_comment (forbidden for non-admin)
# TODO: Add test_delete_other_user_comment_as_admin (allowed) 