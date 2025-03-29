from pydantic import BaseModel
from typing import Optional

from app.schemas.users.user import User


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str
    user: User


class TokenData(BaseModel):
    """Schema for JWT token data."""
    sub: Optional[str] = None
    username: Optional[str] = None


class LoginForm(BaseModel):
    """Schema for login form data."""
    username: str
    password: str


class LogoutResponse(BaseModel):
    """Schema for logout response."""
    message: str = "Successfully logged out"
    user: Optional[User] = None 