import pytest
from sqlalchemy.orm import Session

from app.crud.crud_band import crud_band
from app.schemas.band import BandCreate, BandUpdate
from app.models.band import Band
from app.tests.utils.band import create_random_band


def test_create_band(db_session: Session) -> None:
    """Test creating a new band."""
    band_in = BandCreate(
        name="Test Band CRUD",
        description="Description for CRUD test",
        image_url="https://example.com/crud.jpg"
    )
    band = crud_band.create(db=db_session, obj_in=band_in)
    assert band.name == band_in.name
    assert band.description == band_in.description
    assert band.image_url == band_in.image_url
    assert band.id is not None


def test_get_band(db_session: Session) -> None:
    """Test getting a band by ID."""
    band = create_random_band(db_session)
    retrieved_band = crud_band.get(db=db_session, id=band.id)
    assert retrieved_band
    assert retrieved_band.id == band.id
    assert retrieved_band.name == band.name


def test_get_multi_band(db_session: Session) -> None:
    """Test getting multiple bands."""
    band1 = create_random_band(db_session, name="Band1 Multi")
    band2 = create_random_band(db_session, name="Band2 Multi")
    bands = crud_band.get_multi(db=db_session)
    assert len(bands) >= 2
    band_ids = [b.id for b in bands]
    assert band1.id in band_ids
    assert band2.id in band_ids


def test_update_band(db_session: Session) -> None:
    """Test updating an existing band."""
    band = create_random_band(db_session)
    new_name = "Updated Band Name"
    band_update_data = BandUpdate(name=new_name)
    
    updated_band = crud_band.update(db=db_session, db_obj=band, obj_in=band_update_data)
    assert updated_band.id == band.id
    assert updated_band.name == new_name
    assert updated_band.description == band.description # Should not change unless specified


def test_remove_band(db_session: Session) -> None:
    """Test removing a band."""
    band = create_random_band(db_session)
    band_id = band.id
    
    removed_band = crud_band.remove(db=db_session, id=band_id)
    assert removed_band.id == band_id
    
    band_after_removal = crud_band.get(db=db_session, id=band_id)
    assert band_after_removal is None 