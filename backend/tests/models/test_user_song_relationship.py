import pytest
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.models.user import User
from app.models.song import Song
from app.models.user_song import UserSong


def test_create_user_song_favorite(db_session: Session):
    """Test creating a favorite relationship between user and song."""
    # Create a test user
    user = User(
        email="test_favorite@example.com",
        username="favorite_tester",
        password="securepassword"
    )
    db_session.add(user)
    db_session.commit()
    
    # Create a test song
    song = Song(
        title="Test Favorite Song",
        duration=180,
        file_path="test_favorite.mp3"
    )
    db_session.add(song)
    db_session.commit()
    
    # Create favorite relationship
    user_song = UserSong(
        user_id=user.id,
        song_id=song.id,
        is_favorite=True
    )
    db_session.add(user_song)
    db_session.commit()
    
    # Query the relationship
    result = db_session.execute(
        select(UserSong).where(
            UserSong.user_id == user.id, 
            UserSong.song_id == song.id
        )
    )
    user_song_db = result.scalar_one()
    
    # Verify relationship
    assert user_song_db is not None
    assert user_song_db.is_favorite is True
    assert user_song_db.user_id == user.id
    assert user_song_db.song_id == song.id


def test_user_favorites_relationship(db_session: Session):
    """Test user.favorites relationship."""
    # Create a test user
    user = User(
        email="test_rel@example.com",
        username="rel_tester",
        password="securepassword"
    )
    db_session.add(user)
    db_session.commit()
    
    # Create test songs
    songs = [
        Song(title=f"Favorite Song {i}", duration=180, file_path=f"favorite_{i}.mp3")
        for i in range(3)
    ]
    db_session.add_all(songs)
    db_session.commit()
    
    # Create favorite relationships
    for song in songs:
        user_song = UserSong(
            user_id=user.id,
            song_id=song.id,
            is_favorite=True
        )
        db_session.add(user_song)
    
    db_session.commit()
    
    # Refresh user to load relationships
    db_session.refresh(user)
    
    # Verify relationships through the favorites property
    assert len(user.favorites) == 3
    
    # Verify each song is in favorites
    favorite_ids = [song.id for song in user.favorites]
    for song in songs:
        assert song.id in favorite_ids


def test_song_favorited_by_relationship(db_session: Session):
    """Test song.favorited_by relationship."""
    # Create test users
    users = [
        User(
            email=f"fan_{i}@example.com",
            username=f"fan_{i}",
            password="securepassword"
        )
        for i in range(3)
    ]
    db_session.add_all(users)
    db_session.commit()
    
    # Create a test song
    song = Song(
        title="Popular Song",
        duration=210,
        file_path="popular.mp3"
    )
    db_session.add(song)
    db_session.commit()
    
    # Create favorite relationships
    for user in users:
        user_song = UserSong(
            user_id=user.id,
            song_id=song.id,
            is_favorite=True
        )
        db_session.add(user_song)
    
    db_session.commit()
    
    # Refresh song to load relationships
    db_session.refresh(song)
    
    # Verify relationships through the favorited_by property
    assert len(song.favorited_by) == 3
    
    # Verify each user is in favorited_by
    fan_ids = [user.id for user in song.favorited_by]
    for user in users:
        assert user.id in fan_ids


def test_remove_favorite(db_session: Session):
    """Test removing a favorite relationship."""
    # Create test user and song
    user = User(
        email="unfavorite@example.com",
        username="unfavorite_tester",
        password="securepassword"
    )
    db_session.add(user)
    
    song = Song(
        title="Soon to Unfavorite",
        duration=195,
        file_path="unfavorite.mp3"
    )
    db_session.add(song)
    db_session.commit()
    
    # Create favorite relationship
    user_song = UserSong(
        user_id=user.id,
        song_id=song.id,
        is_favorite=True
    )
    db_session.add(user_song)
    db_session.commit()
    
    # Verify relationship exists
    result = db_session.execute(
        select(func.count()).select_from(UserSong).where(
            UserSong.user_id == user.id,
            UserSong.song_id == song.id
        )
    )
    count = result.scalar_one()
    assert count == 1
    
    # Remove the relationship
    db_session.delete(user_song)
    db_session.commit()
    
    # Verify relationship is removed
    result = db_session.execute(
        select(func.count()).select_from(UserSong).where(
            UserSong.user_id == user.id,
            UserSong.song_id == song.id
        )
    )
    count = result.scalar_one()
    assert count == 0 