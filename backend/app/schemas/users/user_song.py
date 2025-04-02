from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class UserSongBase(BaseModel):
    """Base schema for UserSong."""
    user_id: int
    song_id: int
    is_favorite: bool = False


class UserSongCreate(UserSongBase):
    """Schema for creating a new UserSong relationship."""
    play_count: int = 0
    last_played: Optional[datetime] = None


class UserSongUpdate(BaseModel):
    """Schema for updating an existing UserSong relationship."""
    is_favorite: Optional[bool] = None
    play_count: Optional[int] = None
    last_played: Optional[datetime] = None


class UserSongInDBBase(UserSongBase):
    """Base schema for UserSong from database."""
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True


class UserSong(UserSongBase):
    # Represents the association object itself
    user_id: int
    song_id: int
    last_played_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        # orm_mode = True
        from_attributes = True # Pydantic V2


class FavoriteCreate(BaseModel):
    """Schema for adding a song to favorites."""
    song_id: int


class FavoriteRemove(BaseModel):
    """Schema for removing a song from favorites."""
    song_id: int 