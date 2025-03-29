from typing import Optional, List
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Song(Base):
    """Song model representing a music track."""
    
    # Allow unmapped attributes for backward compatibility
    __allow_unmapped__ = True
    
    # Columns with proper typing for SQLAlchemy 2.0
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False, index=True)
    duration: Mapped[int] = mapped_column(Integer, nullable=False)  # in seconds
    file_path: Mapped[str] = mapped_column(String, nullable=False)
    band_id: Mapped[Optional[int]] = mapped_column(ForeignKey("band.id"), nullable=True, index=True)
    blog_id: Mapped[Optional[int]] = mapped_column(ForeignKey("blog.id"), nullable=True, index=True)
    cover_image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    release_date: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # ISO format date
    
    # Relationships
    band = relationship("Band", back_populates="songs")
    blog = relationship("Blog", back_populates="songs")
    
    favorited_by = relationship(
        "User", 
        secondary="user_song",
        back_populates="favorites",
        viewonly=True,
        primaryjoin="and_(Song.id == UserSong.song_id, UserSong.is_favorite == True)"
    )
    
    tags = relationship(
        "Tag",
        secondary="song_tag",
        back_populates="songs"
    )
    
    comments = relationship("Comment", back_populates="song") 