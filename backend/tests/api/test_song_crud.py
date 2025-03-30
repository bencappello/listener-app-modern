import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Import models to ensure they're registered with Base
from app.models.user import User
from app.models.band import Band
from app.models.blog import Blog
from app.models.tag import Tag
from app.models.song import Song
from app.models.user_song import UserSong
from app.models.user_blog import UserBlog
from app.models.user_follow import UserFollow
from app.models.user_band import UserBand
from app.models.song_tag import SongTag
from app.models.band_tag import BandTag
from app.models.blog_tag import BlogTag
from app.models.comment import Comment

from main import app


def test_create_song(client: TestClient, db: Session, authenticated_user: dict):
    """Test creating a new song (admin only)"""
    # Update the user to be a superuser
    user = authenticated_user["user"]
    user.is_superuser = True
    db.commit()
    
    song_data = {
        "title": "New Test Song",
        "duration": 240,
        "file_path": "/path/to/new-song.mp3",
        "release_date": "2023-05-15"
    }
    
    response = client.post(
        "/api/v1/songs/",
        headers=authenticated_user["headers"],
        json=song_data
    )
    assert response.status_code == 201
    created_song = response.json()
    assert created_song["title"] == song_data["title"]
    assert created_song["duration"] == song_data["duration"]
    
    # Verify song was created in the database
    db_song = db.query(Song).filter(Song.id == created_song["id"]).first()
    assert db_song is not None
    assert db_song.title == song_data["title"]
    
    # Clean up
    db.delete(db_song)
    db.commit()


def test_create_song_normal_user_fails(client: TestClient, db: Session, auth_headers: dict):
    """Test that normal users cannot create songs"""
    song_data = {
        "title": "Unauthorized Song",
        "duration": 180,
        "file_path": "/path/to/unauthorized.mp3",
        "release_date": "2023-05-15"
    }
    
    response = client.post(
        "/api/v1/songs/",
        headers=auth_headers,
        json=song_data
    )
    assert response.status_code == 403


def test_read_songs(client: TestClient, db: Session, auth_headers: dict):
    """Test reading all songs with pagination"""
    # Create test songs
    songs = [
        Song(
            title=f"Pagination Test Song {i}",
            duration=180 + i * 30,
            file_path=f"/path/to/pagination-{i}.mp3",
            release_date="2023-05-15"
        )
        for i in range(5)
    ]
    
    for song in songs:
        db.add(song)
    db.commit()
    
    # Test default pagination (first page)
    response = client.get(
        "/api/v1/songs/",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) <= 10  # Default limit
    
    # Test pagination with skip and limit
    response = client.get(
        "/api/v1/songs/?skip=2&limit=2",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    
    # Clean up
    for song in songs:
        db.delete(song)
    db.commit()


def test_read_song(client: TestClient, db: Session, auth_headers: dict):
    """Test reading a single song by ID"""
    # Create test song
    song = Song(
        title="Detail Test Song",
        duration=240,
        file_path="/path/to/detail-test.mp3",
        release_date="2023-05-15"
    )
    db.add(song)
    db.commit()
    db.refresh(song)
    
    # Test reading the song
    response = client.get(
        f"/api/v1/songs/{song.id}",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == song.title
    assert data["duration"] == song.duration
    
    # Test reading non-existent song
    response = client.get(
        "/api/v1/songs/999999",  # Non-existent ID
        headers=auth_headers
    )
    assert response.status_code == 404
    
    # Clean up
    db.delete(song)
    db.commit()


def test_update_song(client: TestClient, db: Session, authenticated_user: dict):
    """Test updating a song (admin only)"""
    # Update the user to be a superuser
    user = authenticated_user["user"]
    user.is_superuser = True
    db.commit()
    
    # Create test song
    song = Song(
        title="Update Test Song",
        duration=240,
        file_path="/path/to/update-test.mp3",
        release_date="2023-05-15"
    )
    db.add(song)
    db.commit()
    db.refresh(song)
    
    # Update data
    update_data = {
        "title": "Updated Song Title",
        "duration": 300
    }
    
    # Test updating the song
    response = client.put(
        f"/api/v1/songs/{song.id}",
        headers=authenticated_user["headers"],
        json=update_data
    )
    assert response.status_code == 200
    updated_song = response.json()
    assert updated_song["title"] == update_data["title"]
    assert updated_song["duration"] == update_data["duration"]
    assert updated_song["file_path"] == song.file_path  # Unchanged field
    
    # Verify update in database
    db.refresh(song)
    assert song.title == update_data["title"]
    assert song.duration == update_data["duration"]
    
    # Clean up
    db.delete(song)
    db.commit()


def test_update_song_normal_user_fails(client: TestClient, db: Session, auth_headers: dict):
    """Test that normal users cannot update songs"""
    # Create test song
    song = Song(
        title="Unauthorized Update Song",
        duration=240,
        file_path="/path/to/unauthorized-update.mp3",
        release_date="2023-05-15"
    )
    db.add(song)
    db.commit()
    db.refresh(song)
    
    # Update data
    update_data = {
        "title": "Should Not Update",
        "duration": 300
    }
    
    # Test updating the song
    response = client.put(
        f"/api/v1/songs/{song.id}",
        headers=auth_headers,
        json=update_data
    )
    assert response.status_code == 403
    
    # Verify no change in database
    db.refresh(song)
    assert song.title == "Unauthorized Update Song"
    
    # Clean up
    db.delete(song)
    db.commit()


def test_delete_song(client: TestClient, db: Session, authenticated_user: dict):
    """Test deleting a song (admin only)"""
    # Update the user to be a superuser
    user = authenticated_user["user"]
    user.is_superuser = True
    db.commit()
    
    # Create test song
    song = Song(
        title="Delete Test Song",
        duration=240,
        file_path="/path/to/delete-test.mp3",
        release_date="2023-05-15"
    )
    db.add(song)
    db.commit()
    db.refresh(song)
    
    song_id = song.id
    
    # Test deleting the song
    response = client.delete(
        f"/api/v1/songs/{song_id}",
        headers=authenticated_user["headers"]
    )
    assert response.status_code == 204
    
    # Verify deletion in database
    deleted_song = db.query(Song).filter(Song.id == song_id).first()
    assert deleted_song is None


def test_delete_song_normal_user_fails(client: TestClient, db: Session, auth_headers: dict):
    """Test that normal users cannot delete songs"""
    # Create test song
    song = Song(
        title="Unauthorized Delete Song",
        duration=240,
        file_path="/path/to/unauthorized-delete.mp3",
        release_date="2023-05-15"
    )
    db.add(song)
    db.commit()
    db.refresh(song)
    
    # Test deleting the song
    response = client.delete(
        f"/api/v1/songs/{song.id}",
        headers=auth_headers
    )
    assert response.status_code == 403
    
    # Verify song still exists in database
    db.refresh(song)
    assert song is not None
    
    # Clean up
    db.delete(song)
    db.commit() 