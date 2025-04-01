from typing import Any, List

import fastapi
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.post("/", response_model=schemas.Band, status_code=status.HTTP_201_CREATED)
def create_band(
    *, 
    db: Session = Depends(deps.get_db),
    band_in: schemas.BandCreate,
    current_user: models.User = Depends(deps.get_current_active_user), # Require logged-in user
) -> Any:
    """Create new band."""
    # Optionally add permission check here if needed
    # if not crud.user.is_superuser(current_user):
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    band = crud.band.create(db=db, obj_in=band_in)
    return band


@router.get("/", response_model=List[schemas.Band])
def read_bands(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Retrieve bands."""
    bands = crud.band.get_multi(db, skip=skip, limit=limit)
    return bands


@router.get("/{band_id}", response_model=schemas.Band)
def read_band_by_id(
    band_id: int,
    db: Session = Depends(deps.get_db),
) -> Any:
    """Get band by ID."""
    band = crud.band.get(db=db, id=band_id)
    if not band:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Band not found"
        )
    return band


@router.put("/{band_id}", response_model=schemas.Band)
def update_band(
    *,
    db: Session = Depends(deps.get_db),
    band_id: int,
    band_in: schemas.BandUpdate,
    current_user: models.User = Depends(deps.get_current_active_superuser), # Require superuser
) -> Any:
    """Update a band."""
    band = crud.band.get(db=db, id=band_id)
    if not band:
        raise HTTPException(status_code=404, detail="Band not found")
    band = crud.band.update(db=db, db_obj=band, obj_in=band_in)
    return band


@router.delete("/{band_id}", response_model=schemas.Band)
def delete_band(
    *,
    db: Session = Depends(deps.get_db),
    band_id: int,
    current_user: models.User = Depends(deps.get_current_active_superuser), # Require superuser
) -> Any:
    """Delete a band."""
    band = crud.band.get(db=db, id=band_id)
    if not band:
        raise HTTPException(status_code=404, detail="Band not found")
    band = crud.band.remove(db=db, id=band_id)
    return band 