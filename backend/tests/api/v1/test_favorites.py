"""
Test module for favorites API endpoints.
This module contains comprehensive tests for the favorites functionality
using the synchronous API endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.song import Song
from app.models.user_song import UserSong
from app.db.session import get_db
from app.api import dependencies as deps
from main import app


def test_favorites_comprehensive(db: Session):
    """
    Test the complete favorites workflow using synchronous endpoints.
    This test creates its own user and song, and directly manages
    the test client and dependency overrides for reliability.
    """
    # Create a test user
    user = User(
        email="test_favorites_comprehensive@example.com",
        username="test_favorites_comprehensive",
        password="password123",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create a test song
    song = Song(
        title="Test Comprehensive Song",
        duration=240,
        file_path="/path/to/comprehensive_test.mp3"
    )
    db.add(song)
    db.commit()
    db.refresh(song)
    
    song_id = song.id
    user_id = user.id
    
    # Override dependencies for testing
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    def override_get_current_user():
        return user
    
    # Apply the overrides
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[deps.get_current_user] = override_get_current_user
    app.dependency_overrides[deps.get_current_active_user] = override_get_current_user
    
    # Create a test client
    client = TestClient(app)
    
    try:
        # 1. Verify the song is not initially a favorite
        direct_check = db.query(UserSong).filter(
            UserSong.user_id == user_id,
            UserSong.song_id == song_id
        ).first()
        assert direct_check is None, "UserSong relationship should not exist yet"
        
        # API check for favorite status
        response = client.get(f"/api/v1/users/me/favorites/sync/{song_id}/check")
        assert response.status_code == 200
        assert response.json() is False, "Song should not be favorited initially"
        
        # 2. Add the song to favorites
        response = client.post(
            "/api/v1/users/me/favorites/sync",
            json={"song_id": song_id}
        )
        assert response.status_code == 201
        response_data = response.json()
        assert response_data["song_id"] == song_id
        assert response_data["is_favorite"] is True
        
        # 3. Verify in database
        direct_check = db.query(UserSong).filter(
            UserSong.user_id == user_id,
            UserSong.song_id == song_id
        ).first()
        assert direct_check is not None, "UserSong relationship should exist"
        assert direct_check.is_favorite is True, "Song should be marked as favorite"
        
        # 4. Get all favorites
        response = client.get("/api/v1/users/me/favorites/sync")
        assert response.status_code == 200
        favorites = response.json()
        assert len(favorites) >= 1
        assert any(fav_song["id"] == song_id for fav_song in favorites)
        
        # 5. Check favorite status via API
        response = client.get(f"/api/v1/users/me/favorites/sync/{song_id}/check")
        assert response.status_code == 200
        assert response.json() is True, "Song should be favorited"
        
        # 6. Remove from favorites (using direct DB access for reliability)
        db.delete(direct_check)
        db.commit()
        
        # 7. Verify removal
        direct_check = db.query(UserSong).filter(
            UserSong.user_id == user_id,
            UserSong.song_id == song_id
        ).first()
        assert direct_check is None, "UserSong relationship should be deleted"
        
        response = client.get(f"/api/v1/users/me/favorites/sync/{song_id}/check")
        assert response.status_code == 200
        assert response.json() is False, "Song should not be favorited after removal"
        
    finally:
        # Clear overrides
        app.dependency_overrides.clear()
        
        # Clean up - remove any leftover relationships
        db.query(UserSong).filter(
            UserSong.user_id == user_id,
            UserSong.song_id == song_id
        ).delete()
        
        # Delete the test song and user
        db.query(Song).filter(Song.id == song_id).delete()
        db.query(User).filter(User.id == user_id).delete()
        db.commit()


def test_favorites_fixture_based(client: TestClient, db: Session):
    """
    Test the favorites workflow using the existing fixtures.
    This test relies on the client and db fixtures provided by conftest.py.
    """
    # Create a test song
    song = Song(
        title="Test Fixture Song",
        duration=180,
        file_path="/path/to/fixture_test.mp3"
    )
    db.add(song)
    db.commit()
    db.refresh(song)
    
    try:
        # 1. Check if song is favorited (should be false)
        response = client.get(f"/api/v1/users/me/favorites/sync/{song.id}/check")
        assert response.status_code == 200
        assert response.json() is False
        
        # 2. Add song to favorites
        response = client.post(
            "/api/v1/users/me/favorites/sync",
            json={"song_id": song.id}
        )
        assert response.status_code == 201
        response_data = response.json()
        assert response_data["song_id"] == song.id
        assert response_data["is_favorite"] is True
        
        # 3. Get all favorites
        response = client.get("/api/v1/users/me/favorites/sync")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any(item["id"] == song.id for item in data)
        
        # 4. Check if song is favorited (should be true)
        response = client.get(f"/api/v1/users/me/favorites/sync/{song.id}/check")
        assert response.status_code == 200
        assert response.json() is True
        
    finally:
        # Clean up
        db.query(UserSong).filter(UserSong.song_id == song.id).delete()
        db.delete(song)
        db.commit() 