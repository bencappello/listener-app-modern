from typing import Optional, List, Literal
from datetime import datetime
from pydantic import BaseModel, validator


class CommentBase(BaseModel):
    """Base schema for Comment model."""
    content: str


class CommentCreate(CommentBase):
    """Schema for creating a new Comment."""
    song_id: Optional[int] = None
    band_id: Optional[int] = None
    blog_id: Optional[int] = None
    
    @validator('*')
    def check_target_provided(cls, v, values, **kwargs):
        """Validate that exactly one target ID is provided."""
        field = kwargs['field']
        if field.name.endswith('_id'):
            # Count how many target IDs are provided
            target_ids = [
                'song_id' in values and values['song_id'] is not None,
                'band_id' in values and values['band_id'] is not None,
                'blog_id' in values and values['blog_id'] is not None
            ]
            
            if sum(target_ids) == 0 and v is None:
                raise ValueError("At least one target ID (song_id, band_id, or blog_id) must be provided")
            elif sum(target_ids) > 1:
                raise ValueError("Only one target ID (song_id, band_id, or blog_id) can be provided")
        
        return v


class CommentUpdate(CommentBase):
    """Schema for updating an existing Comment."""
    content: Optional[str] = None


class CommentInDBBase(CommentBase):
    """Base schema for Comment model with DB fields."""
    id: int
    user_id: int
    target_type: str
    song_id: Optional[int] = None
    band_id: Optional[int] = None
    blog_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Comment(CommentInDBBase):
    """Schema for returning a Comment."""
    pass


class CommentInDB(CommentInDBBase):
    """Schema for Comment model in DB with all fields."""
    pass 