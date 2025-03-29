from typing import Optional, List
from pydantic import BaseModel, Field, validator
from datetime import datetime


class SongBase(BaseModel):
    """Base schema for Song model."""
    title: str
    duration: int = Field(..., description="Duration in seconds")
    band_id: Optional[int] = None
    cover_image_url: Optional[str] = None
    release_date: Optional[str] = None


class SongCreate(SongBase):
    """Schema for creating a new song."""
    file_path: str = Field(..., description="Path to the song file")


class SongUpdate(BaseModel):
    """Schema for updating an existing song."""
    title: Optional[str] = None
    duration: Optional[int] = None
    band_id: Optional[int] = None
    file_path: Optional[str] = None
    cover_image_url: Optional[str] = None
    release_date: Optional[str] = None


class SongInDBBase(SongBase):
    """Base schema for retrieving song from database."""
    id: int
    file_path: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class Song(SongInDBBase):
    """Schema for returning a Song."""
    favorite_count: Optional[int] = 0


class SongWithDetails(Song):
    """Schema for returning a Song with additional details."""
    band_name: Optional[str] = None
    is_favorited: Optional[bool] = False 