import pytest
from sqlalchemy.orm import Session
from fastapi import HTTPException
import time # Import time module

from app.schemas.bands.band import BandCreate, BandUpdate
from app.utils import random_string
from app.services.band_service import band_service # Assuming band_service is imported

def test_update_band(db_session: Session):
    """Test updating an existing band."""
    band_name = f"Original Band Name {random_string()}"
    band_in = BandCreate(name=band_name, description="Original Description")
    created_band = band_service.create(db=db_session, obj_in=band_in)
    original_updated_at = created_band.updated_at
    
    time.sleep(0.001) # Keep the sleep just in case, doesn't hurt
    
    update_data = BandUpdate(name=f"Updated Band Name {random_string()}", description="Updated Description")
    updated_band = band_service.update(db=db_session, db_obj=created_band, obj_in=update_data)
    
    assert updated_band is not None
    assert updated_band.id == created_band.id
    assert updated_band.name == update_data.name
    assert updated_band.description == update_data.description
    # Final attempt: Compare string representations
    assert str(updated_band.updated_at) != str(original_updated_at)

def test_update_nonexistent_band(db_session: Session):
    """Test updating a band that does not exist."""
    non_existent_band_id = 999999
    non_existent_band = band_service.get(db=db_session, id=non_existent_band_id)
    assert non_existent_band is None

    update_data = BandUpdate(name="Ghost Update")
    # Call update with the None object - Remove pytest.raises context
    updated_result = band_service.update(db=db_session, db_obj=non_existent_band, obj_in=update_data)
    # Assert that the service returns None 
    assert updated_result is None

# --- Test Delete Band ---
def test_delete_band(db_session: Session):
    """Test deleting an existing band."""
    band_name = f"Band to Delete {random_string()}"
    band_in = BandCreate(name=band_name, description="Delete me")
    created_band = band_service.create(db=db_session, obj_in=band_in)
    band_id = created_band.id

    deleted_band = band_service.remove(db=db_session, id=band_id)

    assert deleted_band is not None
    assert deleted_band.id == band_id
    assert deleted_band.name == band_name

    # Verify it's actually deleted
    retrieved_band = band_service.get(db=db_session, id=band_id)
    assert retrieved_band is None

def test_delete_nonexistent_band(db_session: Session):
    """Test deleting a band that does not exist."""
    non_existent_band_id = 999999
    with pytest.raises(HTTPException) as exc_info:
        band_service.remove(db=db_session, id=non_existent_band_id)
    assert exc_info.value.status_code == 404
    assert "not found" in exc_info.value.detail.lower() 