from typing import Optional, List
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import expression
import bcrypt
import re

from app.db.base import Base


class User(Base):
    """User model with authentication capabilities."""
    
    # Allow unmapped attributes for backward compatibility
    __allow_unmapped__ = True
    
    # Define columns with proper typing for SQLAlchemy 2.0
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean, server_default=expression.true(), nullable=False
    )
    
    # Relationships
    favorites = relationship(
        "Song",
        secondary="user_song",
        back_populates="favorited_by",
        viewonly=True,
        primaryjoin="and_(User.id == UserSong.user_id, UserSong.is_favorite == True)",
        secondaryjoin="UserSong.song_id == Song.id"
    )
    
    # New relationships
    followed_blogs = relationship(
        "Blog",
        secondary="user_blog",
        back_populates="followed_by",
        viewonly=True,
        primaryjoin="and_(User.id == UserBlog.user_id, UserBlog.is_following == True)",
        secondaryjoin="UserBlog.blog_id == Blog.id"
    )
    
    followed_users = relationship(
        "User",
        secondary="user_follow",
        primaryjoin="and_(User.id == UserFollow.follower_id, UserFollow.is_following == True)",
        secondaryjoin="UserFollow.followed_id == User.id",
        backref="followers"
    )
    
    comments = relationship("Comment", back_populates="user")
    
    def __init__(self, **kwargs):
        """Initialize user and hash password if provided."""
        if "password" in kwargs:
            kwargs["password"] = self.hash_password(kwargs["password"])
        super().__init__(**kwargs)
        
        # Validate email format
        if not self._is_valid_email(self.email):
            raise ValueError("Invalid email format")
    
    @staticmethod
    def _is_valid_email(email: str) -> bool:
        """Validate email format using regex."""
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        return re.match(email_regex, email) is not None
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt."""
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')
    
    def check_password(self, password: str) -> bool:
        """Check if a password matches the stored hash."""
        password_bytes = password.encode('utf-8')
        hashed_bytes = self.password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    
    def update_password(self, new_password: str) -> None:
        """Update the user's password."""
        self.password = self.hash_password(new_password) 