import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.song import Song
from app.models.user_song import UserSong


def test_favorites_sync_workflow(client: TestClient, db_session: Session):
    """Test the synchronous favorites workflow."""
    # Create a test song
    song = Song(
        title="Test Sync Song",
        duration=180,
        file_path="/path/to/sync_test.mp3"
    )
    db_session.add(song)
    db_session.commit()
    db_session.refresh(song)
    
    try:
        # Step 1: Check if song is favorited (should be false)
        response = client.get(
            f"/api/v1/users/me/favorites/sync/{song.id}/check"
        )
        assert response.status_code == 200
        assert response.json() is False
        
        # Step 2: Add song to favorites
        response = client.post(
            "/api/v1/users/me/favorites/sync",
            json={"song_id": song.id}
        )
        assert response.status_code == 201
        response_data = response.json()
        assert response_data["user_id"] == 1
        assert response_data["song_id"] == song.id
        assert response_data["is_favorite"] is True
        
        # Verify in database
        user_song = db_session.query(UserSong).filter(
            (UserSong.user_id == 1) & 
            (UserSong.song_id == song.id)
        ).first()
        assert user_song is not None
        assert user_song.is_favorite is True
        
        # Step 3: Get all favorites
        response = client.get(
            "/api/v1/users/me/favorites/sync"
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any(item["id"] == song.id for item in data)
        
        # Step 4: Check if song is favorited (should be true)
        response = client.get(
            f"/api/v1/users/me/favorites/sync/{song.id}/check"
        )
        assert response.status_code == 200
        assert response.json() is True
        
    finally:
        # Clean up
        db_session.query(UserSong).filter(UserSong.song_id == song.id).delete()
        db_session.delete(song)
        db_session.commit() 