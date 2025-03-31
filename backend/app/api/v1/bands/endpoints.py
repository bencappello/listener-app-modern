from typing import List, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.band import Band
from app.schemas.bands.band import Band as BandSchema
from app.schemas.bands.band import BandCreate, BandUpdate
from app.api import dependencies # Use centralized dependencies
from app.services.band_service import band_service

router = APIRouter()


@router.post(
    "", 
    response_model=BandSchema, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(dependencies.get_current_active_superuser)] # Protect endpoint
)
def create_band(
    *, # Use keyword-only arguments for clarity
    db: Session = Depends(get_db),
    band_in: BandCreate,
    # current_user: User = Depends(dependencies.get_current_active_superuser) # Dependency already checked
) -> Any:
    """
    Create a new band. Requires superuser privileges.
    Delegates creation logic to the band service.
    """
    # Service handles duplicate check and creation
    # Error handling (like 400 for duplicates) is managed by the service
    return band_service.create(db=db, obj_in=band_in)


@router.get("", response_model=List[BandSchema])
def list_bands(
    *, 
    db: Session = Depends(get_db),
    skip: int = 0, 
    limit: int = 100
) -> Any:
    """
    Retrieve a list of bands with pagination.
    This endpoint is publicly accessible.
    """
    bands = band_service.get_multi(db=db, skip=skip, limit=limit)
    return bands


@router.get("/{band_id}", response_model=BandSchema)
def get_band(
    *, 
    db: Session = Depends(get_db),
    band_id: int
) -> Any:
    """
    Get a specific band by its ID.
    This endpoint is publicly accessible.
    """
    band = band_service.get(db=db, id=band_id)
    if not band:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Band not found"
        )
    return band


@router.put(
    "/{band_id}", 
    response_model=BandSchema,
    dependencies=[Depends(dependencies.get_current_active_superuser)] # Protect endpoint
)
def update_band(
    *, 
    db: Session = Depends(get_db),
    band_id: int,
    band_in: BandUpdate,
    # current_user: User = Depends(dependencies.get_current_active_superuser)
) -> Any:
    """
    Update an existing band. Requires superuser privileges.
    """
    db_band = band_service.get(db=db, id=band_id)
    if not db_band:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Band not found"
        )
    # Service handles the update logic
    updated_band = band_service.update(db=db, db_obj=db_band, obj_in=band_in)
    return updated_band


@router.delete(
    "/{band_id}", 
    response_model=BandSchema, 
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(dependencies.get_current_active_superuser)] # Protect endpoint
)
def delete_band(
    *, 
    db: Session = Depends(get_db),
    band_id: int,
    # current_user: User = Depends(dependencies.get_current_active_superuser)
) -> Any:
    """
    Delete a band by its ID. Requires superuser privileges.
    Service handles the 404 if not found.
    """
    # Service raises HTTPException if not found
    deleted_band = band_service.remove(db=db, id=band_id) 
    return deleted_band 