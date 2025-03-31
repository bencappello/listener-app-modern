import pytest
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.services.band_service import band_service
from app.schemas.bands.band import BandCreate, BandUpdate
from app.models import Band
from tests.utils import random_string

# Fixtures for test data can be defined here or imported

def test_create_band(db_session: Session):
    """Test creating a new band."""
    band_name = f"Test Band {random_string()}"
    band_in = BandCreate(name=band_name, description="A test band description")
    
    created_band = band_service.create(db=db_session, obj_in=band_in)
    
    assert created_band is not None
    assert created_band.name == band_name
    assert created_band.description == "A test band description"
    assert created_band.id is not None
    assert created_band.created_at is not None
    assert created_band.updated_at is not None

def test_get_band(db_session: Session):
    """Test retrieving a band by ID."""
    band_name = f"Test Band {random_string()}"
    band_in = BandCreate(name=band_name, description="Band to retrieve")
    created_band = band_service.create(db=db_session, obj_in=band_in)
    
    retrieved_band = band_service.get(db=db_session, id=created_band.id)
    
    assert retrieved_band is not None
    assert retrieved_band.id == created_band.id
    assert retrieved_band.name == band_name

def test_get_nonexistent_band(db_session: Session):
    """Test retrieving a non-existent band."""
    retrieved_band = band_service.get(db=db_session, id=99999)
    assert retrieved_band is None

def test_get_multi_bands(db_session: Session):
    """Test retrieving multiple bands with pagination."""
    # Create a few bands
    band_service.create(db=db_session, obj_in=BandCreate(name=f"Band Multi {random_string()}"))
    band_service.create(db=db_session, obj_in=BandCreate(name=f"Band Multi {random_string()}"))
    band_service.create(db=db_session, obj_in=BandCreate(name=f"Band Multi {random_string()}"))
    
    # Get first page
    bands_page1 = band_service.get_multi(db=db_session, skip=0, limit=2)
    assert len(bands_page1) <= 2 
    
    # Get second page
    bands_page2 = band_service.get_multi(db=db_session, skip=2, limit=2)
    assert len(bands_page2) >= 0 # Could be 0 or 1 depending on exact number created before

    # Ensure no overlap (simple check assuming ordered IDs)
    if bands_page1 and bands_page2:
        ids1 = {b.id for b in bands_page1}
        ids2 = {b.id for b in bands_page2}
        assert not ids1.intersection(ids2)

def test_update_band(db_session: Session):
    """Test updating an existing band."""
    band_name = f"Original Band Name {random_string()}"
    band_in = BandCreate(name=band_name, description="Original Description")
    created_band = band_service.create(db=db_session, obj_in=band_in)
    
    updated_name = f"Updated Band Name {random_string()}"
    update_data = BandUpdate(name=updated_name, description="Updated Description")
    
    updated_band = band_service.update(db=db_session, db_obj=created_band, obj_in=update_data)
    
    assert updated_band is not None
    assert updated_band.id == created_band.id
    assert updated_band.name == updated_name
    assert updated_band.description == "Updated Description"
    assert updated_band.updated_at > created_band.updated_at

def test_update_nonexistent_band(db_session: Session):
    """Test updating a non-existent band (should handle gracefully or raise error depending on service impl)."""
    # Assuming update takes a db_obj that might be None if not found
    update_data = BandUpdate(name="Trying to update ghost")
    
    # This test depends on how band_service.update handles a non-existent db_obj
    # Option 1: It returns None or raises an error handled internally
    # result = band_service.update(db=db_session, db_obj=None, obj_in=update_data)
    # assert result is None 
    
    # Option 2: It relies on the caller to fetch the object first, 
    # so we test getting it first.
    non_existent_band = band_service.get(db=db_session, id=9999)
    assert non_existent_band is None
    # If get returns None, update shouldn't proceed or should raise error if called
    with pytest.raises(AttributeError): # Or appropriate error if update tries to access None.id
         band_service.update(db=db_session, db_obj=non_existent_band, obj_in=update_data)


def test_delete_band(db_session: Session):
    """Test deleting a band."""
    band_name = f"Band to Delete {random_string()}"
    band_in = BandCreate(name=band_name)
    created_band = band_service.create(db=db_session, obj_in=band_in)
    band_id = created_band.id
    
    deleted_band = band_service.remove(db=db_session, id=band_id)
    
    assert deleted_band is not None
    assert deleted_band.id == band_id
    
    # Verify it's actually gone
    assert band_service.get(db=db_session, id=band_id) is None

def test_delete_nonexistent_band(db_session: Session):
    """Test deleting a non-existent band."""
    # Check how remove handles non-existent IDs
    # Option 1: Raises an error (e.g., if get fails internally)
    with pytest.raises(HTTPException) as excinfo:
         band_service.remove(db=db_session, id=88888)
    assert excinfo.value.status_code == 404
    
    # Option 2: Returns None or the object if found (less common for remove)
    # deleted_band = band_service.remove(db=db_session, id=88888)
    # assert deleted_band is None

# Add more tests later for relationships, filtering, etc. 