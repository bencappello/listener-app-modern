from typing import Optional, List
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import expression

from app.db.base import Base


class Blog(Base):
    """Blog model representing a music blog source."""
    
    # Allow unmapped attributes for backward compatibility
    __allow_unmapped__ = True
    
    # Columns with proper typing for SQLAlchemy 2.0
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    url: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    rss_feed_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean, server_default=expression.true(), nullable=False
    )
    last_scraped_at: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # ISO format date
    
    # Relationships
    songs = relationship("Song", back_populates="blog")
    followed_by = relationship(
        "User",
        secondary="user_blog",
        back_populates="followed_blogs",
        viewonly=True,
    )
    
    tags = relationship(
        "Tag",
        secondary="blog_tag",
        back_populates="blogs"
    )
    
    comments = relationship("Comment", back_populates="blog") 