import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, selectinload

from app.core.config import settings
from app.models.song import Song
from app.models.band import Band
from app.models.blog import Blog
from app.models.user import User
from app.models import Tag
from fastapi import FastAPI
from app.tests.utils.song import create_random_song
from app.tests.utils.band import create_random_band
from app.tests.utils.blog import create_random_blog

pytestmark = pytest.mark.asyncio

@pytest_asyncio.fixture(scope="function")
async def test_band(async_db: AsyncSession) -> int:
    band = Band(name="Test Band", description="Test Description")
    async_db.add(band)
    await async_db.commit()
    await async_db.refresh(band)
    return band.id

@pytest_asyncio.fixture(scope="function")
async def test_blog(async_db: AsyncSession) -> int:
    blog = Blog(name="Test Blog", description="Test Content", url="http://testblog.com")
    async_db.add(blog)
    await async_db.commit()
    await async_db.refresh(blog)
    return blog.id

@pytest_asyncio.fixture(scope="function")
async def test_song(async_db: AsyncSession, test_band: int, test_blog: int) -> int:
    song = Song(
        title="Test Song",
        duration=180,
        file_path="/path/to/song.mp3",
        band_id=test_band,
        blog_id=test_blog,
        cover_image_url="http://example.com/cover.jpg"
    )
    async_db.add(song)
    await async_db.commit()
    await async_db.refresh(song)
    return song.id

async def test_create_song(
    async_client: AsyncClient,
    authenticated_user: dict,
    test_band: int,
    test_blog: int
):
    data = {
        "title": "New Song",
        "duration": 240,
        "file_path": "/path/to/new_song.mp3",
        "band_id": test_band,
        "blog_id": test_blog,
        "cover_image_url": "http://example.com/new_cover.jpg"
    }
    response = await async_client.post(
        "/api/v1/songs/",
        json=data,
        headers=authenticated_user["headers"]
    )
    assert response.status_code == 201
    assert response.json()["title"] == "New Song"

async def test_create_song_invalid_band(
    async_client: AsyncClient,
    authenticated_user: dict,
    test_blog: int
):
    data = {
        "title": "New Song",
        "duration": 240,
        "file_path": "/path/to/new_song.mp3",
        "band_id": 999999,  # Non-existent band ID
        "blog_id": test_blog,
        "cover_image_url": "http://example.com/new_cover.jpg"
    }
    response = await async_client.post(
        "/api/v1/songs/",
        json=data,
        headers=authenticated_user["headers"]
    )
    assert response.status_code == 404

async def test_create_song_unauthorized(async_client: AsyncClient):
    data = {
        "title": "New Song",
        "duration": 240,
        "file_path": "/path/to/new_song.mp3",
        "cover_image_url": "http://example.com/new_cover.jpg"
    }
    response = await async_client.post("/api/v1/songs/", json=data)
    assert response.status_code == 401

async def test_read_songs(
    async_client: AsyncClient,
    authenticated_user: dict,
    test_song: int
):
    response = await async_client.get(
        "/api/v1/songs/",
        headers=authenticated_user["headers"]
    )
    assert response.status_code == 200
    assert len(response.json()) >= 1

async def test_read_song(
    async_client: AsyncClient,
    authenticated_user: dict,
    test_song: int
):
    response = await async_client.get(
        f"/api/v1/songs/{test_song}",
        headers=authenticated_user["headers"]
    )
    assert response.status_code == 200
    assert response.json()["id"] == test_song

async def test_read_nonexistent_song(
    async_client: AsyncClient,
    authenticated_user: dict
):
    response = await async_client.get(
        "/api/v1/songs/999999",
        headers=authenticated_user["headers"]
    )
    assert response.status_code == 404

async def test_update_song(
    async_client: AsyncClient,
    authenticated_user: dict,
    test_song: int
):
    data = {"title": "Updated Song"}
    response = await async_client.put(
        f"/api/v1/songs/{test_song}",
        json=data,
        headers=authenticated_user["headers"]
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Song"

async def test_update_nonexistent_song(
    async_client: AsyncClient,
    authenticated_user: dict
):
    data = {"title": "Updated Song"}
    response = await async_client.put(
        "/api/v1/songs/999999",
        json=data,
        headers=authenticated_user["headers"]
    )
    assert response.status_code == 404

async def test_delete_song(
    async_client: AsyncClient,
    authenticated_user: dict,
    test_song: int
):
    response = await async_client.delete(
        f"/api/v1/songs/{test_song}",
        headers=authenticated_user["headers"]
    )
    assert response.status_code == 204

async def test_create_song_with_tags(
    async_client: AsyncClient, async_db_session: AsyncSession, superuser_token_headers: dict
):
    band = create_random_band(async_db_session)
    blog = create_random_blog(async_db_session)
    song_data = {
        "title": "Song With Tags",
        "duration": 210,
        "file_path": "/tags/song.mp3",
        "band_id": band.id,
        "blog_id": blog.id,
        "tags": ["Rock", "Indie", " Test Tag "]
    }
    response = await async_client.post(
        f"{settings.API_V1_STR}/songs/", headers=superuser_token_headers, json=song_data
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == song_data["title"]
    assert "id" in content
    song_id = content["id"]

    stmt = select(Song).options(selectinload(Song.tags)).where(Song.id == song_id)
    result = await async_db_session.execute(stmt)
    song_db = result.scalar_one()
    assert len(song_db.tags) == 3
    tag_names = {tag.name for tag in song_db.tags}
    assert "Rock" in tag_names
    assert "Indie" in tag_names
    assert "Test Tag" in tag_names

async def test_update_song_tags(
    async_client: AsyncClient, async_db_session: AsyncSession, superuser_token_headers: dict
):
    song = create_random_song(async_db_session)
    
    update_data_add = {"tags": ["Pop", "Electronic"]}
    response_add = await async_client.put(
        f"{settings.API_V1_STR}/songs/{song.id}", headers=superuser_token_headers, json=update_data_add
    )
    assert response_add.status_code == 200
    assert len(response_add.json()["tags"]) == 2
    assert {t["name"] for t in response_add.json()["tags"]} == {"Pop", "Electronic"}

    update_data_replace = {"tags": ["Ambient"]}
    response_replace = await async_client.put(
        f"{settings.API_V1_STR}/songs/{song.id}", headers=superuser_token_headers, json=update_data_replace
    )
    assert response_replace.status_code == 200
    assert len(response_replace.json()["tags"]) == 1
    assert response_replace.json()["tags"][0]["name"] == "Ambient"

    update_data_clear = {"tags": []}
    response_clear = await async_client.put(
        f"{settings.API_V1_STR}/songs/{song.id}", headers=superuser_token_headers, json=update_data_clear
    )
    assert response_clear.status_code == 200
    assert len(response_clear.json()["tags"]) == 0 