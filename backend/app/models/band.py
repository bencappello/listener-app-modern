from typing import Optional, List
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Band(Base):
    """Band model representing a music artist or group."""
    
    # Allow unmapped attributes for backward compatibility
    __allow_unmapped__ = True
    
    # Columns with proper typing for SQLAlchemy 2.0
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # Relationships
    songs = relationship("Song", back_populates="band")
    
    tags = relationship(
        "Tag",
        secondary="band_tag",
        back_populates="bands"
    )
    
    comments = relationship("Comment", back_populates="band")
    
    # User follow relationships
    user_associations = relationship("UserBand", back_populates="band")
    followed_by = relationship(
        "User",
        secondary="user_bands",
        back_populates="followed_bands",
        viewonly=True,
        primaryjoin="Band.id == UserBand.band_id",
        secondaryjoin="and_(UserBand.user_id == User.id, UserBand.is_following == True)"
    )
    
    # Direct access to followers for convenience
    followers = relationship(
        "User",
        secondary="user_bands",
        backref="followed_bands_direct",
        primaryjoin="Band.id == UserBand.band_id",
        secondaryjoin="UserBand.user_id == User.id",
    ) 