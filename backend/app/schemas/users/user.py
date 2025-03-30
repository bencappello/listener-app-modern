from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class UserBase(BaseModel):
    """Base schema for User."""
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    full_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a new user."""
    email: EmailStr
    password: str
    username: str


class UserUpdate(UserBase):
    """Schema for updating an existing user."""
    password: Optional[str] = None


class UserInDBBase(UserBase):
    """Base schema for User from database."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True


class User(UserInDBBase):
    """Schema for retrieving a User."""
    pass


class UserInDB(UserInDBBase):
    """Schema for User with hashed password."""
    hashed_password: str
    
    class Config:
        orm_mode = True 