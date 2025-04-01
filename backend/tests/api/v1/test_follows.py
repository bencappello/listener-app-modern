import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User, Blog, UserBlog, UserFollow
from app.tests.utils.user import create_random_user
from app.tests.utils.blog import create_random_blog
from app.core.config import settings

pytestmark = pytest.mark.asyncio

async def test_follow_blog(async_client: AsyncClient, async_db_session: AsyncSession, user_token_headers: dict):
    user = await async_db_session.get(User, 2) # Assuming user ID 2 from fixtures
    blog = create_random_blog(async_db_session) # Sync util for now
    
    # Follow the blog
    response = await async_client.post(
        f"{settings.API_V1_STR}/blogs/{blog.id}/follow", 
        headers=user_token_headers
    )
    assert response.status_code == 201 # Or 200 if update
    content = response.json()
    assert content["user_id"] == user.id
    assert content["blog_id"] == blog.id
    assert content["is_following"] is True

    # Verify relationship exists and is_following is true
    from sqlalchemy import select, and_
    stmt = select(UserBlog).where(and_(UserBlog.user_id == user.id, UserBlog.blog_id == blog.id))
    result = await async_db_session.execute(stmt)
    user_blog_db = result.scalar_one_or_none()
    assert user_blog_db is not None
    assert user_blog_db.is_following is True

async def test_follow_nonexistent_blog(async_client: AsyncClient, user_token_headers: dict):
    response = await async_client.post(
        f"{settings.API_V1_STR}/blogs/999999/follow", 
        headers=user_token_headers
    )
    assert response.status_code == 404

async def test_unfollow_blog(async_client: AsyncClient, async_db_session: AsyncSession, user_token_headers: dict):
    user = await async_db_session.get(User, 2)
    blog = create_random_blog(async_db_session)
    
    # Follow first
    await async_client.post(f"{settings.API_V1_STR}/blogs/{blog.id}/follow", headers=user_token_headers)
    
    # Unfollow
    response = await async_client.delete(
        f"{settings.API_V1_STR}/blogs/{blog.id}/follow", 
        headers=user_token_headers
    )
    assert response.status_code == 204

    # Verify relationship exists but is_following is false
    from sqlalchemy import select, and_
    stmt = select(UserBlog).where(and_(UserBlog.user_id == user.id, UserBlog.blog_id == blog.id))
    result = await async_db_session.execute(stmt)
    user_blog_db = result.scalar_one_or_none()
    assert user_blog_db is not None
    assert user_blog_db.is_following is False

async def test_get_followed_blogs(async_client: AsyncClient, async_db_session: AsyncSession, user_token_headers: dict):
    user = await async_db_session.get(User, 2)
    # Create and follow blogs
    blog1 = create_random_blog(async_db_session)
    blog2 = create_random_blog(async_db_session)
    await async_client.post(f"{settings.API_V1_STR}/blogs/{blog1.id}/follow", headers=user_token_headers)
    await async_client.post(f"{settings.API_V1_STR}/blogs/{blog2.id}/follow", headers=user_token_headers)
    
    response = await async_client.get(
        f"{settings.API_V1_STR}/users/me/followed-blogs", 
        headers=user_token_headers
    )
    assert response.status_code == 200
    content = response.json()
    assert isinstance(content, list)
    assert len(content) >= 2 # Might include others followed in different tests
    followed_ids = {b["id"] for b in content}
    assert blog1.id in followed_ids
    assert blog2.id in followed_ids

async def test_check_following_status(async_client: AsyncClient, async_db_session: AsyncSession, user_token_headers: dict):
    user = await async_db_session.get(User, 2)
    blog = create_random_blog(async_db_session)

    # Check initially (should be false)
    response = await async_client.get(f"{settings.API_V1_STR}/blogs/{blog.id}/is-followed", headers=user_token_headers)
    assert response.status_code == 200
    assert response.json() is False

    # Follow
    await async_client.post(f"{settings.API_V1_STR}/blogs/{blog.id}/follow", headers=user_token_headers)

    # Check again (should be true)
    response = await async_client.get(f"{settings.API_V1_STR}/blogs/{blog.id}/is-followed", headers=user_token_headers)
    assert response.status_code == 200
    assert response.json() is True

    # Unfollow
    await async_client.delete(f"{settings.API_V1_STR}/blogs/{blog.id}/follow", headers=user_token_headers)

    # Check finally (should be false)
    response = await async_client.get(f"{settings.API_V1_STR}/blogs/{blog.id}/is-followed", headers=user_token_headers)
    assert response.status_code == 200
    assert response.json() is False

# === User Follow Tests ===

async def test_follow_user(async_client: AsyncClient, async_db_session: AsyncSession, user_token_headers: dict):
    follower = await async_db_session.get(User, 2) # Current user from token
    followed = create_random_user(async_db_session) # Sync util for now
    
    # Follow the user
    response = await async_client.post(
        f"{settings.API_V1_STR}/users/{followed.id}/follow", 
        headers=user_token_headers
    )
    assert response.status_code == 201
    content = response.json()
    assert content["follower_id"] == follower.id
    assert content["followed_id"] == followed.id
    assert content["is_following"] is True

    # Verify relationship
    from sqlalchemy import select, and_
    stmt = select(UserFollow).where(and_(UserFollow.follower_id == follower.id, UserFollow.followed_id == followed.id))
    result = await async_db_session.execute(stmt)
    user_follow_db = result.scalar_one_or_none()
    assert user_follow_db is not None
    assert user_follow_db.is_following is True

async def test_follow_nonexistent_user(async_client: AsyncClient, user_token_headers: dict):
    response = await async_client.post(
        f"{settings.API_V1_STR}/users/999999/follow", 
        headers=user_token_headers
    )
    assert response.status_code == 404

async def test_follow_self(async_client: AsyncClient, user_token_headers: dict):
    # Assuming the current user from token has ID 2
    response = await async_client.post(
        f"{settings.API_V1_STR}/users/2/follow", 
        headers=user_token_headers
    )
    assert response.status_code == 400 # Service logic prevents self-follow

async def test_unfollow_user(async_client: AsyncClient, async_db_session: AsyncSession, user_token_headers: dict):
    follower = await async_db_session.get(User, 2)
    followed = create_random_user(async_db_session)
    
    # Follow first
    await async_client.post(f"{settings.API_V1_STR}/users/{followed.id}/follow", headers=user_token_headers)
    
    # Unfollow
    response = await async_client.delete(
        f"{settings.API_V1_STR}/users/{followed.id}/follow", 
        headers=user_token_headers
    )
    assert response.status_code == 204

    # Verify relationship exists but is_following is false
    from sqlalchemy import select, and_
    stmt = select(UserFollow).where(and_(UserFollow.follower_id == follower.id, UserFollow.followed_id == followed.id))
    result = await async_db_session.execute(stmt)
    user_follow_db = result.scalar_one_or_none()
    assert user_follow_db is not None
    assert user_follow_db.is_following is False

async def test_get_followed_users(async_client: AsyncClient, async_db_session: AsyncSession, user_token_headers: dict):
    follower = await async_db_session.get(User, 2)
    # Create and follow users
    user1 = create_random_user(async_db_session)
    user2 = create_random_user(async_db_session)
    await async_client.post(f"{settings.API_V1_STR}/users/{user1.id}/follow", headers=user_token_headers)
    await async_client.post(f"{settings.API_V1_STR}/users/{user2.id}/follow", headers=user_token_headers)
    
    response = await async_client.get(
        f"{settings.API_V1_STR}/users/me/followed-users", 
        headers=user_token_headers
    )
    assert response.status_code == 200
    content = response.json()
    assert isinstance(content, list)
    assert len(content) >= 2 
    followed_ids = {u["id"] for u in content}
    assert user1.id in followed_ids
    assert user2.id in followed_ids

async def test_get_user_followers(async_client: AsyncClient, async_db_session: AsyncSession, user_token_headers: dict):
    followed_user = await async_db_session.get(User, 2) # Test followers of current user
    # Create users and make them follow user 2
    follower1 = create_random_user(async_db_session)
    follower2 = create_random_user(async_db_session)
    
    # Need tokens for follower1 and follower2 or use admin to create follows
    # For simplicity, let's assume admin can create follows or use direct service call if testing API directly
    # Here, we'll just check the endpoint exists and returns a list (might be empty if no followers)
    
    response = await async_client.get(
        f"{settings.API_V1_STR}/users/{followed_user.id}/followers", 
        headers=user_token_headers # Can use any authenticated user token to view public followers
    )
    assert response.status_code == 200
    content = response.json()
    assert isinstance(content, list)
    # Cannot assert specific followers without creating them via API/service

async def test_check_following_user_status(async_client: AsyncClient, async_db_session: AsyncSession, user_token_headers: dict):
    follower = await async_db_session.get(User, 2)
    followed = create_random_user(async_db_session)

    # Check initially (should be false)
    response = await async_client.get(f"{settings.API_V1_STR}/users/{followed.id}/is-followed", headers=user_token_headers)
    assert response.status_code == 200
    assert response.json() is False

    # Follow
    await async_client.post(f"{settings.API_V1_STR}/users/{followed.id}/follow", headers=user_token_headers)

    # Check again (should be true)
    response = await async_client.get(f"{settings.API_V1_STR}/users/{followed.id}/is-followed", headers=user_token_headers)
    assert response.status_code == 200
    assert response.json() is True

    # Unfollow
    await async_client.delete(f"{settings.API_V1_STR}/users/{followed.id}/follow", headers=user_token_headers)

    # Check finally (should be false)
    response = await async_client.get(f"{settings.API_V1_STR}/users/{followed.id}/is-followed", headers=user_token_headers)
    assert response.status_code == 200
    assert response.json() is False 