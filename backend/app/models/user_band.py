from sqlalchemy import Column, Integer, ForeignKey, DateTime, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class UserBand(Base):
    """Association table for users and bands they follow."""
    
    __tablename__ = "user_bands"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    band_id = Column(Integer, ForeignKey("band.id", ondelete="CASCADE"), nullable=False)
    
    # Add boolean flag for follows
    is_following = Column(Boolean, default=True, nullable=False)
    
    # Add timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(), 
        nullable=False
    )
    
    # Add unique constraint to prevent duplicate entries
    __table_args__ = (
        UniqueConstraint("user_id", "band_id", name="uix_user_band"),
    )
    
    # Relationships
    user = relationship("User", back_populates="band_associations", overlaps="followed_bands_direct,followers")
    band = relationship("Band", back_populates="user_associations", overlaps="followed_bands_direct,followers") 