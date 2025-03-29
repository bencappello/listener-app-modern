from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models.user import User
from app.models.song import Song
from app.models.user_song import UserSong
from app.schemas.songs import Song as SongSchema, SongWithDetails
from app.schemas.users.user_song import FavoriteCreate, FavoriteRemove, UserSong as UserSongSchema
from app.services.favorites import (
    get_user_favorites, add_to_favorites, remove_from_favorites, check_if_favorited,
    get_user_favorites_async, add_to_favorites_async, remove_from_favorites_async, check_if_favorited_async
)

router = APIRouter()


@router.get("/", response_model=List[SongWithDetails])
async def read_user_favorites(
    current_user: User = Depends(deps.get_current_user_async),
    db: AsyncSession = Depends(deps.get_async_db)
):
    """
    Get list of user's favorite songs with additional details.
    """
    return await get_user_favorites_async(db, current_user.id)


@router.post("/", response_model=UserSongSchema, status_code=status.HTTP_201_CREATED)
async def add_favorite(
    favorite: FavoriteCreate,
    current_user: User = Depends(deps.get_current_user_async),
    db: AsyncSession = Depends(deps.get_async_db)
):
    """
    Add a song to user's favorites.
    """
    return await add_to_favorites_async(db, current_user.id, favorite.song_id)


@router.delete("/{song_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    song_id: int,
    current_user: User = Depends(deps.get_current_user_async),
    db: AsyncSession = Depends(deps.get_async_db)
):
    """
    Remove a song from user's favorites.
    """
    await remove_from_favorites_async(db, current_user.id, song_id)
    return None


@router.get("/{song_id}/check", response_model=bool)
async def check_favorite(
    song_id: int,
    current_user: User = Depends(deps.get_current_user_async),
    db: AsyncSession = Depends(deps.get_async_db)
):
    """
    Check if a song is in user's favorites.
    """
    return await check_if_favorited_async(db, current_user.id, song_id) 