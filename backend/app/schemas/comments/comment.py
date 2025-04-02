from typing import Optional, List, Literal, Any
from datetime import datetime
from pydantic import BaseModel, validator, model_validator


class CommentBase(BaseModel):
    """Base schema for Comment model."""
    content: str
    song_id: Optional[int] = None
    band_id: Optional[int] = None
    blog_id: Optional[int] = None


class CommentCreate(CommentBase):
    """Schema for creating a new Comment."""
    
    # Use model_validator for cross-field validation
    @model_validator(mode='before')
    @classmethod
    def check_single_target(cls, data: Any) -> Any:
        if isinstance(data, dict):
            targets_provided = sum(
                1 
                for field in ['song_id', 'band_id', 'blog_id'] 
                if data.get(field) is not None
            )
            if targets_provided == 0:
                raise ValueError('Comment must have one target: song_id, band_id, or blog_id')
            if targets_provided > 1:
                raise ValueError('Comment can only have one target: song_id, band_id, or blog_id')
        return data


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
        # orm_mode = True
        from_attributes = True # Pydantic V2


class Comment(CommentInDBBase):
    """Schema for returning a Comment."""
    pass


class CommentInDB(CommentInDBBase):
    """Schema for Comment model in DB with all fields."""
    pass 