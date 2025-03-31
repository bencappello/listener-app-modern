from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

# Forward reference for Song schema
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.schemas.songs.song import Song as SongSchema 


class BandBase(BaseModel):
    """Base schema for Band."""
    name: str
    description: Optional[str] = None
    website_url: Optional[str] = None
    image_url: Optional[str] = None
    genre: Optional[str] = None


class BandCreate(BandBase):
    """Schema for creating a new band."""
    pass


class BandUpdate(BaseModel):
    """Schema for updating an existing band."""
    name: Optional[str] = None
    description: Optional[str] = None
    website_url: Optional[str] = None
    image_url: Optional[str] = None
    genre: Optional[str] = None


class BandInDBBase(BandBase):
    """Base schema for Band from database."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True


class Band(BandInDBBase):
    """Schema for retrieving a Band."""
    followers_count: Optional[int] = 0


class BandWithUserDetails(Band):
    """Schema for returning a Band with user-specific details."""
    is_following: Optional[bool] = False
    
    class Config:
        orm_mode = True


class BandWithSongs(Band):
    """Schema for band with songs relationship."""
    # Use forward reference for Song schema type hint
    songs: List["SongSchema"] = Field(default_factory=list)
    
    class Config:
        orm_mode = True 