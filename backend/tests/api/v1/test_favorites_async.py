import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.user import User
from app.models.song import Song
from app.models.user_song import UserSong


@pytest_asyncio.fixture
async def test_song_async(async_db: AsyncSession) -> Song:
    """Fixture to create a test song for async API tests."""
    song = Song(
        title="Test Async Favorites Song",
        duration=180,
        file_path="/path/to/test_async_song.mp3"
    )
    async_db.add(song)
    await async_db.commit()
    await async_db.refresh(song)
    return song


@pytest.mark.asyncio
async def test_add_to_favorites_async(
    async_client: AsyncClient,
    async_test_db_user: User,
    async_auth_headers: dict,
    test_song_async: Song,
    async_db: AsyncSession
):
    """Test adding a song to user's favorites asynchronously."""
    response = await async_client.post(
        "/api/v1/users/me/favorites",
        headers=async_auth_headers,
        json={"song_id": test_song_async.id}
    )
    
    assert response.status_code == 201
    
    # Verify in database
    query = select(func.count()).select_from(UserSong).where(
        UserSong.user_id == async_test_db_user.id,
        UserSong.song_id == test_song_async.id,
        UserSong.is_favorite == True
    )
    result = await async_db.execute(query)
    count = result.scalar_one()
    assert count == 1


@pytest.mark.asyncio
async def test_get_favorites_async(
    async_client: AsyncClient,
    async_test_db_user: User,
    async_auth_headers: dict,
    test_song_async: Song,
    async_db: AsyncSession
):
    """Test retrieving user's favorite songs asynchronously."""
    # Add song to favorites
    user_song = UserSong(
        user_id=async_test_db_user.id,
        song_id=test_song_async.id,
        is_favorite=True
    )
    async_db.add(user_song)
    await async_db.commit()
    
    # Request favorites
    response = await async_client.get(
        "/api/v1/users/me/favorites",
        headers=async_auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == test_song_async.id
    assert data[0]["title"] == test_song_async.title
    assert data[0]["is_favorited"] is True


@pytest.mark.asyncio
async def test_remove_from_favorites_async(
    async_client: AsyncClient,
    async_test_db_user: User,
    async_auth_headers: dict,
    test_song_async: Song,
    async_db: AsyncSession
):
    """Test removing a song from user's favorites asynchronously."""
    # Add song to favorites
    user_song = UserSong(
        user_id=async_test_db_user.id,
        song_id=test_song_async.id,
        is_favorite=True
    )
    async_db.add(user_song)
    await async_db.commit()
    
    # Remove from favorites
    response = await async_client.delete(
        f"/api/v1/users/me/favorites/{test_song_async.id}",
        headers=async_auth_headers
    )
    
    assert response.status_code == 204
    
    # Verify in database
    query = select(func.count()).select_from(UserSong).where(
        UserSong.user_id == async_test_db_user.id,
        UserSong.song_id == test_song_async.id,
        UserSong.is_favorite == True
    )
    result = await async_db.execute(query)
    count = result.scalar_one()
    assert count == 0


@pytest.mark.asyncio
async def test_check_favorite_status_async(
    async_client: AsyncClient,
    async_test_db_user: User,
    async_auth_headers: dict,
    test_song_async: Song,
    async_db: AsyncSession
):
    """Test checking if a song is in user's favorites asynchronously."""
    # Check before adding (should be False)
    response = await async_client.get(
        f"/api/v1/users/me/favorites/{test_song_async.id}/check",
        headers=async_auth_headers
    )
    
    assert response.status_code == 200
    assert response.json() is False
    
    # Add to favorites
    user_song = UserSong(
        user_id=async_test_db_user.id,
        song_id=test_song_async.id,
        is_favorite=True
    )
    async_db.add(user_song)
    await async_db.commit()
    
    # Check after adding (should be True)
    response = await async_client.get(
        f"/api/v1/users/me/favorites/{test_song_async.id}/check",
        headers=async_auth_headers
    )
    
    assert response.status_code == 200
    assert response.json() is True 