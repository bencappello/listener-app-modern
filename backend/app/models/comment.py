from typing import Optional, List
from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Comment(Base):
    """Comment model for user comments on various content types."""
    
    # Allow unmapped attributes for backward compatibility
    __allow_unmapped__ = True
    
    # Columns with proper typing for SQLAlchemy 2.0
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False, index=True)
    
    # Polymorphic fields for different comment targets
    target_type: Mapped[str] = mapped_column(String, nullable=False, index=True)
    song_id: Mapped[Optional[int]] = mapped_column(ForeignKey("song.id"), nullable=True)
    band_id: Mapped[Optional[int]] = mapped_column(ForeignKey("band.id"), nullable=True)
    blog_id: Mapped[Optional[int]] = mapped_column(ForeignKey("blog.id"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="comments")
    song = relationship("Song", back_populates="comments")
    band = relationship("Band", back_populates="comments")
    blog = relationship("Blog", back_populates="comments")
    
    def __init__(self, **kwargs):
        """Initialize with target type based on which ID is provided."""
        super().__init__(**kwargs)
        
        # Set target_type based on which ID is provided
        if "song_id" in kwargs and kwargs["song_id"] is not None:
            self.target_type = "song"
        elif "band_id" in kwargs and kwargs["band_id"] is not None:
            self.target_type = "band"
        elif "blog_id" in kwargs and kwargs["blog_id"] is not None:
            self.target_type = "blog" 