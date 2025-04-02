from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class TagBase(BaseModel):
    """Base schema for Tag."""
    name: str
    description: Optional[str] = None


class TagCreate(TagBase):
    """Schema for creating a new tag."""
    pass


class TagUpdate(BaseModel):
    """Schema for updating an existing tag."""
    name: Optional[str] = None
    description: Optional[str] = None


class TagInDBBase(TagBase):
    """Base schema for Tag from database."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        # orm_mode = True
        from_attributes = True # Pydantic V2


class Tag(TagInDBBase):
    """Schema for retrieving a Tag."""
    count: Optional[int] = 0


class TagInDB(TagInDBBase):
    """Schema for Tag model in DB with all fields."""
    pass 