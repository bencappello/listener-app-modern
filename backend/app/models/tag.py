from typing import Optional, List
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Tag(Base):
    """Tag model for categorizing content."""
    
    # Allow unmapped attributes for backward compatibility
    __allow_unmapped__ = True
    
    # Columns with proper typing for SQLAlchemy 2.0
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # Relationships
    songs = relationship(
        "Song",
        secondary="song_tag",
        back_populates="tags"
    )
    bands = relationship(
        "Band",
        secondary="band_tag",
        back_populates="tags"
    )
    blogs = relationship(
        "Blog",
        secondary="blog_tag",
        back_populates="tags"
    ) 