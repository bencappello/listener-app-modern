import pytest
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.band import Band
from app.db.base import Base


class TestBandModel:
    """Test suite for Band model."""

    def test_create_band(self, db_session: Session):
        """Test creating a new band."""
        band = Band(
            name="Test Band",
            description="This is a test band for unit testing",
            image_url="https://example.com/band.jpg"
        )
        db_session.add(band)
        db_session.commit()
        db_session.refresh(band)

        assert band.id is not None
        assert band.name == "Test Band"
        assert band.description == "This is a test band for unit testing"
        assert band.image_url == "https://example.com/band.jpg"
        assert band.created_at is not None
        assert band.updated_at is not None

    def test_band_name_unique(self, db_session: Session):
        """Test that band names must be unique."""
        band1 = Band(
            name="Duplicate Band",
            description="First band"
        )
        db_session.add(band1)
        db_session.commit()

        band2 = Band(
            name="Duplicate Band",
            description="Second band with same name"
        )
        db_session.add(band2)
        
        with pytest.raises(Exception):  # SQLite raises different exception than PostgreSQL
            db_session.commit()
            
        db_session.rollback()

    def test_null_name(self, db_session: Session):
        """Test that band name cannot be null."""
        band = Band(description="Band without a name")
        db_session.add(band)
        
        with pytest.raises(Exception):
            db_session.commit()
            
        db_session.rollback()

    def test_empty_description(self, db_session: Session):
        """Test that band can have empty description."""
        band = Band(name="Band with empty description")
        db_session.add(band)
        db_session.commit()
        db_session.refresh(band)
        
        assert band.id is not None
        assert band.name == "Band with empty description"
        assert band.description is None

    def test_band_relationships(self, db_session: Session):
        """Test band relationships (placeholder)."""
        # This test will be expanded when Song model is implemented
        band = Band(name="Band with relationships")
        db_session.add(band)
        db_session.commit()
        
        # Verify empty relationships
        assert hasattr(band, "songs")
        assert len(band.songs) == 0 