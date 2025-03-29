from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class TagBase(BaseModel):
    """Base schema for Tag model."""
    name: str
    description: Optional[str] = None


class TagCreate(TagBase):
    """Schema for creating a new Tag."""
    pass


class TagUpdate(TagBase):
    """Schema for updating an existing Tag."""
    name: Optional[str] = None
    description: Optional[str] = None


class TagInDBBase(TagBase):
    """Base schema for Tag model with DB fields."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Tag(TagInDBBase):
    """Schema for returning a Tag."""
    pass


class TagInDB(TagInDBBase):
    """Schema for Tag model in DB with all fields."""
    pass 