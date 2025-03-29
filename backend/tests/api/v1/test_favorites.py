import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import select, func, text

from app.models.user import User
from app.models.song import Song
from app.models.user_song import UserSong


@pytest.fixture
def test_song(db_session: Session) -> Song:
    """Fixture to create a test song for API tests."""
    song = Song(
        title="Test Favorites Song",
        duration=180,
        file_path="/path/to/test_song.mp3"
    )
    db_session.add(song)
    db_session.commit()
    db_session.refresh(song)
    return song


def test_add_to_favorites(
    client: TestClient,
    test_db_user: User,
    auth_headers: dict,
    test_song: Song,
    db: Session
):
    """Test adding a song to user's favorites."""
    response = client.post(
        "/api/v1/users/me/favorites",
        headers=auth_headers,
        json={"song_id": test_song.id}
    )
    
    assert response.status_code == 201
    
    # Verify in database
    query = select(func.count()).select_from(UserSong).where(
        UserSong.user_id == test_db_user.id,
        UserSong.song_id == test_song.id,
        UserSong.is_favorite == True
    )
    result = db.execute(query)
    count = result.scalar_one()
    assert count == 1


def test_get_favorites(
    client: TestClient,
    test_db_user: User,
    auth_headers: dict,
    test_song: Song,
    db: Session
):
    """Test retrieving user's favorite songs."""
    # Add song to favorites
    user_song = UserSong(
        user_id=test_db_user.id,
        song_id=test_song.id,
        is_favorite=True
    )
    db.add(user_song)
    db.commit()
    
    # Request favorites
    response = client.get(
        "/api/v1/users/me/favorites",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == test_song.id
    assert data[0]["title"] == test_song.title
    assert data[0]["is_favorited"] is True


def test_remove_from_favorites(
    client: TestClient,
    test_db_user: User,
    auth_headers: dict,
    test_song: Song,
    db: Session
):
    """Test removing a song from user's favorites."""
    # Add song to favorites
    user_song = UserSong(
        user_id=test_db_user.id,
        song_id=test_song.id,
        is_favorite=True
    )
    db.add(user_song)
    db.commit()
    
    # Remove from favorites
    response = client.delete(
        f"/api/v1/users/me/favorites/{test_song.id}",
        headers=auth_headers
    )
    
    assert response.status_code == 204
    
    # Verify in database
    query = select(func.count()).select_from(UserSong).where(
        UserSong.user_id == test_db_user.id,
        UserSong.song_id == test_song.id,
        UserSong.is_favorite == True
    )
    result = db.execute(query)
    count = result.scalar_one()
    assert count == 0


def test_check_favorite_status(
    client: TestClient,
    test_db_user: User,
    auth_headers: dict,
    test_song: Song,
    db: Session
):
    """Test checking if a song is in user's favorites."""
    # Check before adding (should be False)
    response = client.get(
        f"/api/v1/users/me/favorites/{test_song.id}/check",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    assert response.json() is False
    
    # Add to favorites
    user_song = UserSong(
        user_id=test_db_user.id,
        song_id=test_song.id,
        is_favorite=True
    )
    db.add(user_song)
    db.commit()
    
    # Check after adding (should be True)
    response = client.get(
        f"/api/v1/users/me/favorites/{test_song.id}/check",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    assert response.json() is True 