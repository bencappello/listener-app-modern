from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    """Base user schema with common attributes."""
    email: EmailStr
    username: str


class UserCreate(UserBase):
    """Schema for user creation with password."""
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """Schema for user updates."""
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)


class UserInDB(UserBase):
    """Schema for user in database, including hashed password."""
    id: int
    is_active: bool = True
    
    model_config = ConfigDict(from_attributes=True)


class User(UserBase):
    """Schema for user response without password."""
    id: int
    is_active: bool = True
    
    model_config = ConfigDict(from_attributes=True) 