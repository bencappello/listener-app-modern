from sqlalchemy import Boolean, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import expression
from datetime import datetime

from app.db.base import Base


class UserSong(Base):
    """Association model for User-Song relationships (favorites)."""
    
    # Allow unmapped attributes for backward compatibility
    __allow_unmapped__ = True
    
    # Table name explicitly set for the association
    __tablename__ = "user_song"
    
    # Composite primary key
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), primary_key=True)
    song_id: Mapped[int] = mapped_column(ForeignKey("song.id"), primary_key=True)
    
    # Additional fields
    is_favorite: Mapped[bool] = mapped_column(
        Boolean, 
        server_default=expression.true(),
        nullable=False
    )
    play_count: Mapped[int] = mapped_column(
        Integer,
        server_default="0",
        nullable=False
    )
    last_played: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True
    )
    
    def __init__(self, **kwargs):
        """Initialize with default values."""
        super().__init__(**kwargs)
        
        # Set default values if not provided
        if "play_count" not in kwargs:
            self.play_count = 0
        if "is_favorite" not in kwargs:
            self.is_favorite = True 