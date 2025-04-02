from typing import Optional, List
from pydantic import BaseModel, Field, validator, HttpUrl
from datetime import datetime, date


class SongBase(BaseModel):
    """Base schema for Song model."""
    title: str
    duration: int = Field(..., description="Duration in seconds")
    band_id: Optional[int] = None
    blog_id: Optional[int] = None
    cover_image_url: Optional[str] = None
    release_date: Optional[str] = None


class SongCreate(SongBase):
    """Schema for creating a new song."""
    file_path: str = Field(..., description="Path to the song file")
    tags: Optional[List[str]] = None


class SongUpdate(BaseModel):
    """Schema for updating an existing song."""
    title: Optional[str] = None
    duration: Optional[int] = None
    band_id: Optional[int] = None
    blog_id: Optional[int] = None
    file_path: Optional[str] = None
    cover_image_url: Optional[HttpUrl] = None
    release_date: Optional[date] = None
    tags: Optional[List[str]] = None


class SongInDBBase(SongBase):
    """Base schema for Song model with DB fields."""
    id: int
    band_id: Optional[int] = None
    blog_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        # orm_mode = True
        from_attributes = True # Pydantic V2


class Song(SongInDBBase):
    """Schema for returning a Song."""
    favorite_count: Optional[int] = 0


class SongWithDetails(Song):
    """Schema for returning a Song with additional details."""
    band_name: Optional[str] = None
    is_favorited: Optional[bool] = False 