from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, HttpUrl, Field


class BlogBase(BaseModel):
    """Base schema for Blog model."""
    name: str
    url: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    rss_feed_url: Optional[str] = None
    is_active: bool = True


class BlogCreate(BlogBase):
    """Schema for creating a new Blog."""
    pass


class BlogUpdate(BlogBase):
    """Schema for updating an existing Blog."""
    name: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    rss_feed_url: Optional[str] = None
    is_active: Optional[bool] = None
    last_scraped_at: Optional[str] = None


class BlogInDBBase(BlogBase):
    """Base schema for Blog model with DB fields."""
    id: int
    created_at: datetime
    updated_at: datetime
    last_scraped_at: Optional[str] = None

    class Config:
        orm_mode = True


class Blog(BlogInDBBase):
    """Schema for returning a Blog."""
    pass


class BlogInDB(BlogInDBBase):
    """Schema for Blog model in DB with all fields."""
    pass 