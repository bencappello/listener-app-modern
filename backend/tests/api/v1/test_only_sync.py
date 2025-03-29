import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.song import Song
from app.models.user_song import UserSong


def test_basics(client: TestClient, db: Session):
    """Test basic operations with synchronous client."""
    
    # Test if we can get status code from a non-existing endpoint (at least tests if the client works)
    response = client.get("/non-existing-endpoint")
    assert response.status_code == 404  # At least we get a proper 404
    
    # Create a test user directly in the database
    user = User(
        email="test_sync@example.com",
        username="test_sync_user",
        password="password123",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create a test song
    song = Song(
        title="Test Basic Song",
        duration=180,
        file_path="/path/to/test_song.mp3"
    )
    db.add(song)
    db.commit()
    db.refresh(song)
    
    # Create a favorite relationship directly in the database
    user_song = UserSong(
        user_id=user.id,
        song_id=song.id,
        is_favorite=True
    )
    db.add(user_song)
    db.commit()
    
    # The test passes if we can perform these basic operations 