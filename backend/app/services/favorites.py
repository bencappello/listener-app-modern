from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func, update, and_, delete
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.song import Song
from app.models.band import Band
from app.models.user_song import UserSong
from app.schemas.songs import SongWithDetails


def get_user_favorites(db: Session, user_id: int) -> List[SongWithDetails]:
    """Retrieve all favorite songs for a user with band details."""
    # Query all favorite songs for the user
    query = select(Song, Band.name.label("band_name")).join(
        UserSong, and_(
            UserSong.song_id == Song.id,
            UserSong.user_id == user_id,
            UserSong.is_favorite == True
        )
    ).outerjoin(Band, Song.band_id == Band.id)
    
    result = db.execute(query)
    songs_with_bands = result.all()
    
    # Convert to response schema
    favorites = []
    for song, band_name in songs_with_bands:
        song_dict = {
            "id": song.id,
            "title": song.title,
            "duration": song.duration,
            "file_path": song.file_path,
            "band_id": song.band_id,
            "cover_image_url": song.cover_image_url,
            "release_date": song.release_date,
            "created_at": song.created_at,
            "updated_at": song.updated_at,
            "favorite_count": 1,  # At least this user has favorited it
            "band_name": band_name,
            "is_favorited": True  # Since this is the favorites list
        }
        favorites.append(SongWithDetails(**song_dict))
    
    return favorites


async def get_user_favorites_async(db: AsyncSession, user_id: int) -> List[SongWithDetails]:
    """Retrieve all favorite songs for a user with band details (async version)."""
    # Query all favorite songs for the user
    query = select(Song, Band.name.label("band_name")).join(
        UserSong, and_(
            UserSong.song_id == Song.id,
            UserSong.user_id == user_id,
            UserSong.is_favorite == True
        )
    ).outerjoin(Band, Song.band_id == Band.id)
    
    result = await db.execute(query)
    songs_with_bands = result.all()
    
    # Convert to response schema
    favorites = []
    for song, band_name in songs_with_bands:
        song_dict = {
            "id": song.id,
            "title": song.title,
            "duration": song.duration,
            "file_path": song.file_path,
            "band_id": song.band_id,
            "cover_image_url": song.cover_image_url,
            "release_date": song.release_date,
            "created_at": song.created_at,
            "updated_at": song.updated_at,
            "favorite_count": 1,  # At least this user has favorited it
            "band_name": band_name,
            "is_favorited": True  # Since this is the favorites list
        }
        favorites.append(SongWithDetails(**song_dict))
    
    return favorites


def add_to_favorites(db: Session, user_id: int, song_id: int) -> UserSong:
    """Add a song to user's favorites."""
    # Check if song exists
    result = db.execute(select(Song).where(Song.id == song_id))
    song = result.scalar_one_or_none()
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Song with id {song_id} not found"
        )
    
    # Check if relationship already exists
    result = db.execute(
        select(UserSong).where(
            UserSong.user_id == user_id,
            UserSong.song_id == song_id
        )
    )
    user_song = result.scalar_one_or_none()
    
    if user_song:
        # Update existing relationship if not already favorited
        if not user_song.is_favorite:
            user_song.is_favorite = True
            db.commit()
            db.refresh(user_song)
    else:
        # Create new relationship
        user_song = UserSong(
            user_id=user_id,
            song_id=song_id,
            is_favorite=True
        )
        db.add(user_song)
        db.commit()
        db.refresh(user_song)
    
    return user_song


async def add_to_favorites_async(db: AsyncSession, user_id: int, song_id: int) -> UserSong:
    """Add a song to user's favorites (async version)."""
    # Check if song exists
    result = await db.execute(select(Song).where(Song.id == song_id))
    song = result.scalar_one_or_none()
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Song with id {song_id} not found"
        )
    
    # Check if relationship already exists
    result = await db.execute(
        select(UserSong).where(
            UserSong.user_id == user_id,
            UserSong.song_id == song_id
        )
    )
    user_song = result.scalar_one_or_none()
    
    if user_song:
        # Update existing relationship if not already favorited
        if not user_song.is_favorite:
            user_song.is_favorite = True
            await db.commit()
            await db.refresh(user_song)
    else:
        # Create new relationship
        user_song = UserSong(
            user_id=user_id,
            song_id=song_id,
            is_favorite=True
        )
        await db.add(user_song)
        await db.commit()
        await db.refresh(user_song)
    
    return user_song


def remove_from_favorites(db: Session, user_id: int, song_id: int) -> None:
    """Remove a song from user's favorites."""
    result = db.execute(
        select(UserSong).where(
            UserSong.user_id == user_id,
            UserSong.song_id == song_id
        )
    )
    user_song = result.scalar_one_or_none()
    
    if not user_song:
        # Nothing to remove
        return
    
    if user_song.play_count > 0:
        # If the user has played the song, just update the favorite status
        user_song.is_favorite = False
        db.commit()
    else:
        # If no play history, remove the relationship entirely
        db.delete(user_song)
        db.commit()


async def remove_from_favorites_async(db: AsyncSession, user_id: int, song_id: int) -> None:
    """Remove a song from user's favorites (async version)."""
    result = await db.execute(
        select(UserSong).where(
            UserSong.user_id == user_id,
            UserSong.song_id == song_id
        )
    )
    user_song = result.scalar_one_or_none()
    
    if not user_song:
        # Nothing to remove
        return
    
    if user_song.play_count > 0:
        # If the user has played the song, just update the favorite status
        user_song.is_favorite = False
        await db.commit()
    else:
        # If no play history, remove the relationship entirely
        await db.delete(user_song)
        await db.commit()


def check_if_favorited(db: Session, user_id: int, song_id: int) -> bool:
    """Check if a song is in user's favorites."""
    result = db.execute(
        select(UserSong).where(
            UserSong.user_id == user_id,
            UserSong.song_id == song_id,
            UserSong.is_favorite == True
        )
    )
    user_song = result.scalar_one_or_none()
    return user_song is not None


async def check_if_favorited_async(db: AsyncSession, user_id: int, song_id: int) -> bool:
    """Check if a song is in user's favorites (async version)."""
    result = await db.execute(
        select(UserSong).where(
            UserSong.user_id == user_id,
            UserSong.song_id == song_id,
            UserSong.is_favorite == True
        )
    )
    user_song = result.scalar_one_or_none()
    return user_song is not None 