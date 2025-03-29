from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SongTag(Base):
    """Association model for Song-Tag relationships."""
    
    # Allow unmapped attributes for backward compatibility
    __allow_unmapped__ = True
    
    # Table name explicitly set for the association
    __tablename__ = "song_tag"
    
    # Composite primary key
    song_id: Mapped[int] = mapped_column(ForeignKey("song.id"), primary_key=True)
    tag_id: Mapped[int] = mapped_column(ForeignKey("tag.id"), primary_key=True) 