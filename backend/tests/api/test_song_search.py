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
from app.api import deps
from app.services.auth import create_access_token


def test_search_songs(client: TestClient, db: Session, auth_headers: dict):
    """Test searching songs with various filters"""
    # Create test data
    band = Band(name="Test Band")
    db.add(band)
    db.commit()
    db.refresh(band)
    
    blog = Blog(name="Test Blog", url="https://testblog.com", is_active=True)
    db.add(blog)
    db.commit()
    db.refresh(blog)
    
    tag = Tag(name="test-tag")
    db.add(tag)
    db.commit()
    db.refresh(tag)
    
    # Create sample songs
    songs = [
        Song(
            title="Test Song 1",
            duration=180,
            file_path="/path/to/song1.mp3",
            band_id=band.id,
            release_date="2023-01-01"
        ),
        Song(
            title="Test Song 2",
            duration=240,
            file_path="/path/to/song2.mp3",
            blog_id=blog.id,
            release_date="2023-02-01"
        ),
        Song(
            title="Another Song",
            duration=300,
            file_path="/path/to/song3.mp3",
            band_id=band.id,
            release_date="2023-03-01"
        )
    ]
    
    for song in songs:
        db.add(song)
    
    db.commit()
    
    # Add tag to the first song
    songs[0].tags.append(tag)
    db.commit()
    
    # Test basic search
    response = client.get(
        "/api/v1/songs/search?query=Test",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert len(response.json()) == 3
    
    # Test search with band filter
    response = client.get(
        f"/api/v1/songs/search?query=Song&band_id={band.id}",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert len(response.json()) == 2
    
    # Test search with blog filter
    response = client.get(
        f"/api/v1/songs/search?query=Song&blog_id={blog.id}",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert len(response.json()) == 1
    
    # Test search by tag
    response = client.get(
        "/api/v1/songs/search?query=test-tag",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert len(response.json()) == 1
    
    # Test search with multiple filters
    response = client.get(
        f"/api/v1/songs/search?query=Song&release_year=2023&min_duration=200",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert len(response.json()) == 2
    
    # Test search with sorting
    response = client.get(
        "/api/v1/songs/search?query=Test&sort_by=oldest",
        headers=auth_headers
    )
    assert response.status_code == 200
    results = response.json()
    assert len(results) == 3
    assert results[0]["title"] == "Test Song 1"  # Oldest first
    
    # Cleanup
    db.query(Song).delete()
    db.query(Band).delete()
    db.query(Blog).delete()
    db.query(Tag).delete()
    db.commit()


def test_get_popular_songs(client: TestClient, db: Session, auth_headers: dict):
    """Test getting popular songs"""
    # Create test user
    user1 = User(
        email="testuser1@example.com",
        username="testuser1",
        password="password123",
        is_active=True
    )
    user2 = User(
        email="testuser2@example.com",
        username="testuser2",
        password="password123",
        is_active=True
    )
    db.add(user1)
    db.add(user2)
    db.commit()
    db.refresh(user1)
    db.refresh(user2)
    
    # Create test songs
    songs = [
        Song(
            title="Popular Song 1",
            duration=180,
            file_path="/path/to/popular1.mp3",
            release_date="2023-01-01"
        ),
        Song(
            title="Popular Song 2",
            duration=240,
            file_path="/path/to/popular2.mp3",
            release_date="2023-02-01"
        ),
        Song(
            title="Unpopular Song",
            duration=300,
            file_path="/path/to/unpopular.mp3",
            release_date="2023-03-01"
        )
    ]
    
    for song in songs:
        db.add(song)
    
    db.commit()
    
    # Add favorites to make songs "popular"
    db.add(UserSong(user_id=user1.id, song_id=songs[0].id, is_favorite=True))
    db.add(UserSong(user_id=user1.id, song_id=songs[1].id, is_favorite=True))
    db.add(UserSong(user_id=user2.id, song_id=songs[0].id, is_favorite=True))
    db.commit()
    
    # Test getting popular songs
    response = client.get(
        "/api/v1/songs/popular",
        headers=auth_headers
    )
    assert response.status_code == 200
    popular_songs = response.json()
    
    # First song should be most popular (2 favorites)
    assert len(popular_songs) >= 2
    assert popular_songs[0]["title"] == "Popular Song 1"
    
    # Test with time period
    response = client.get(
        "/api/v1/songs/popular?time_period=month",
        headers=auth_headers
    )
    assert response.status_code == 200
    
    # Test invalid time period
    response = client.get(
        "/api/v1/songs/popular?time_period=invalid",
        headers=auth_headers
    )
    assert response.status_code == 422  # Unprocessable Entity due to regex validation
    
    # Cleanup
    db.query(UserSong).delete()
    db.query(Song).delete()
    db.query(User).delete()
    db.commit()


def test_user_feed(client: TestClient, db: Session, authenticated_user: dict):
    """Test getting the user feed"""
    user = authenticated_user["user"]
    user_token_headers = authenticated_user["headers"]
    
    # Create test blogs and bands
    blog = Blog(name="Followed Blog", url="https://followedblog.com", is_active=True)
    other_blog = Blog(name="Other Blog", url="https://otherblog.com", is_active=True)
    band = Band(name="Followed Band")
    
    db.add(blog)
    db.add(other_blog)
    db.add(band)
    db.commit()
    db.refresh(blog)
    db.refresh(other_blog)
    db.refresh(band)
    
    # User follows the blog and band
    blog.followers.append(user)
    band.followers.append(user)
    db.commit()
    
    # Create test songs
    songs = [
        Song(
            title="Followed Blog Song",
            duration=180,
            file_path="/path/to/blog-song.mp3",
            blog_id=blog.id,
            release_date="2023-01-01"
        ),
        Song(
            title="Followed Band Song",
            duration=240,
            file_path="/path/to/band-song.mp3",
            band_id=band.id,
            release_date="2023-02-01"
        ),
        Song(
            title="Unrelated Song",
            duration=300,
            file_path="/path/to/unrelated.mp3",
            blog_id=other_blog.id,
            release_date="2023-03-01"
        )
    ]
    
    for song in songs:
        db.add(song)
    
    db.commit()
    
    # Test getting user feed
    response = client.get(
        "/api/v1/songs/feed",
        headers=user_token_headers
    )
    assert response.status_code == 200
    feed_songs = response.json()
    
    # Feed should only contain songs from followed blogs and bands
    assert len(feed_songs) == 2
    feed_titles = [song["title"] for song in feed_songs]
    assert "Followed Blog Song" in feed_titles
    assert "Followed Band Song" in feed_titles
    assert "Unrelated Song" not in feed_titles
    
    # Cleanup
    db.query(Song).delete()
    db.query(Band).delete()
    db.query(Blog).delete()
    db.query(User).delete()
    db.commit() 