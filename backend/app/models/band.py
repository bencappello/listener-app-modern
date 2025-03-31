from typing import Optional, List
from sqlalchemy import String, and_
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
# Forward references for type hints
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .song import Song
    from .tag import Tag
    from .comment import Comment
    from .user_band import UserBand
    from .user import User


class Band(Base):
    """Band model representing a music artist or group."""
    
    # Allow unmapped attributes for backward compatibility
    __allow_unmapped__ = True
    
    # Columns with proper typing for SQLAlchemy 2.0
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    website_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    genre: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # Relationships
    songs: Mapped[List["Song"]] = relationship("Song", back_populates="band")
    
    tags: Mapped[List["Tag"]] = relationship(
        "Tag",
        secondary="band_tag",
        back_populates="bands"
    )
    
    comments: Mapped[List["Comment"]] = relationship("Comment", back_populates="band")
    
    # User follow relationships
    user_associations: Mapped[List["UserBand"]] = relationship("UserBand", back_populates="band")
    followed_by: Mapped[List["User"]] = relationship(
        "User",
        secondary="user_bands",
        back_populates="followed_bands",
        viewonly=True,
        primaryjoin="Band.id == UserBand.band_id",
        secondaryjoin="and_(UserBand.user_id == User.id, UserBand.is_following == True)"
    )
    
    # Direct access to followers for convenience
    followers: Mapped[List["User"]] = relationship(
        "User",
        secondary="user_bands",
        backref="followed_bands_direct",
        primaryjoin="Band.id == UserBand.band_id",
        secondaryjoin="UserBand.user_id == User.id",
    ) 