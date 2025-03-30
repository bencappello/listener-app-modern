from typing import Optional, List, Literal
from datetime import datetime
from pydantic import BaseModel, validator


class CommentBase(BaseModel):
    """Base schema for Comment model."""
    content: str
    song_id: Optional[int] = None
    band_id: Optional[int] = None
    blog_id: Optional[int] = None


class CommentCreate(CommentBase):
    """Schema for creating a new Comment."""
    
    @validator('song_id', 'band_id', 'blog_id')
    def check_target_entity(cls, v, values, **kwargs):
        """Ensure at least one target entity is specified."""
        field = kwargs.get('field', None)
        
        # Skip validation if this field is None (not specified)
        if v is None:
            return v
            
        # Check for multiple entity IDs
        all_entity_fields = ['song_id', 'band_id', 'blog_id']
        all_entity_fields.remove(field.name)
        
        # Make sure other entity fields aren't specified
        for other_field in all_entity_fields:
            if other_field in values and values[other_field] is not None:
                raise ValueError('A comment can only be associated with one entity: song, band, or blog')
                
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
        orm_mode = True


class Comment(CommentInDBBase):
    """Schema for returning a Comment."""
    pass


class CommentInDB(CommentInDBBase):
    """Schema for Comment model in DB with all fields."""
    pass 