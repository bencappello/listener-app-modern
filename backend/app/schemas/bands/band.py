from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class BandBase(BaseModel):
    """Base band schema with common attributes."""
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None


class BandCreate(BandBase):
    """Schema for band creation."""
    pass


class BandUpdate(BaseModel):
    """Schema for band updates."""
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None


class Band(BandBase):
    """Schema for band response."""
    id: int
    
    model_config = ConfigDict(from_attributes=True)


class BandWithSongs(Band):
    """Schema for band with songs relationship."""
    # This will be populated when the Song schema is created
    songs: List = Field(default_factory=list)
    
    model_config = ConfigDict(from_attributes=True) 