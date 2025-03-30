from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


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
    # This will be populated when the Song schema is created
    songs: List = Field(default_factory=list)
    
    class Config:
        orm_mode = True 