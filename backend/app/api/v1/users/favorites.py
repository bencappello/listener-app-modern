from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.song import Song
from app.models.user_song import UserSong
from app.schemas.songs import Song as SongSchema, SongWithDetails
from app.schemas.users.user_song import FavoriteCreate, FavoriteRemove, UserSong as UserSongSchema
from app.services.favorites import get_user_favorites, add_to_favorites, remove_from_favorites, check_if_favorited

router = APIRouter()


@router.get("/", response_model=List[SongWithDetails])
def read_user_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of user's favorite songs with additional details.
    """
    return get_user_favorites(db, current_user.id)


@router.post("/", response_model=UserSongSchema, status_code=status.HTTP_201_CREATED)
def add_favorite(
    favorite: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a song to user's favorites.
    """
    return add_to_favorites(db, current_user.id, favorite.song_id)


@router.delete("/{song_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(
    song_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a song from user's favorites.
    """
    remove_from_favorites(db, current_user.id, song_id)
    return None


@router.get("/{song_id}/check", response_model=bool)
def check_favorite(
    song_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if a song is in user's favorites.
    """
    return check_if_favorited(db, current_user.id, song_id) 