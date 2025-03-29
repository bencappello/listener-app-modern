from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class UserSongBase(BaseModel):
    """Base schema for User-Song relationship."""
    user_id: int
    song_id: int


class UserSongCreate(UserSongBase):
    """Schema for creating a user-song relationship."""
    is_favorite: bool = True
    play_count: int = 0
    last_played: Optional[datetime] = None


class UserSongUpdate(BaseModel):
    """Schema for updating a user-song relationship."""
    is_favorite: Optional[bool] = None
    play_count: Optional[int] = None
    last_played: Optional[datetime] = None


class UserSongInDB(UserSongBase):
    """Schema for retrieving user-song relationship from database."""
    is_favorite: bool
    play_count: int
    last_played: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class UserSong(UserSongInDB):
    """Schema for returning a user-song relationship."""
    pass


class FavoriteCreate(BaseModel):
    """Schema for adding a song to favorites."""
    song_id: int


class FavoriteRemove(BaseModel):
    """Schema for removing a song from favorites."""
    song_id: int 