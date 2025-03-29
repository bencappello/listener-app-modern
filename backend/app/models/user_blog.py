from sqlalchemy import Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import expression
from datetime import datetime

from app.db.base import Base


class UserBlog(Base):
    """Association model for User-Blog relationships (followed blogs)."""
    
    # Allow unmapped attributes for backward compatibility
    __allow_unmapped__ = True
    
    # Table name explicitly set for the association
    __tablename__ = "user_blog"
    
    # Composite primary key
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), primary_key=True)
    blog_id: Mapped[int] = mapped_column(ForeignKey("blog.id"), primary_key=True)
    
    # Additional fields
    is_following: Mapped[bool] = mapped_column(
        Boolean, 
        server_default=expression.true(),
        nullable=False
    )
    followed_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    
    def __init__(self, **kwargs):
        """Initialize with default values."""
        super().__init__(**kwargs)
        
        # Set default values if not provided
        if "is_following" not in kwargs:
            self.is_following = True
        if "followed_at" not in kwargs:
            self.followed_at = datetime.utcnow() 