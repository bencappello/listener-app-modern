from typing import List, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.band import Band
from app.schemas.bands.band import Band as BandSchema
from app.schemas.bands.band import BandCreate, BandUpdate
from app.api.dependencies import get_current_user

router = APIRouter()


@router.post("", response_model=BandSchema, status_code=status.HTTP_201_CREATED)
async def create_band(
    band_data: BandCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Create a new band.
    
    Args:
        band_data: Band creation data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Band: Created band
        
    Raises:
        HTTPException: If band creation fails
    """
    # Check if band with same name already exists
    if db.query(Band).filter(Band.name == band_data.name).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Band with name '{band_data.name}' already exists"
        )
    
    # Create new band
    try:
        band = Band(**band_data.model_dump())
        db.add(band)
        db.commit()
        db.refresh(band)
        return band
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Band creation failed"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )


@router.get("", response_model=List[BandSchema])
async def list_bands(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
) -> Any:
    """
    List all bands.
    
    Args:
        skip: Number of bands to skip
        limit: Maximum number of bands to return
        db: Database session
        
    Returns:
        List[Band]: List of bands
    """
    bands = db.query(Band).offset(skip).limit(limit).all()
    return bands


@router.get("/{band_id}", response_model=BandSchema)
async def get_band(
    band_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get a specific band by ID.
    
    Args:
        band_id: Band ID
        db: Database session
        
    Returns:
        Band: Band with specified ID
        
    Raises:
        HTTPException: If band is not found
    """
    band = db.query(Band).filter(Band.id == band_id).first()
    if band is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Band with ID {band_id} not found"
        )
    return band


@router.put("/{band_id}", response_model=BandSchema)
async def update_band(
    band_id: int,
    band_data: BandUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update a band.
    
    Args:
        band_id: Band ID
        band_data: Band update data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Band: Updated band
        
    Raises:
        HTTPException: If band is not found or update fails
    """
    band = db.query(Band).filter(Band.id == band_id).first()
    if band is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Band with ID {band_id} not found"
        )
    
    # Update band attributes
    update_data = band_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(band, key, value)
    
    try:
        db.commit()
        db.refresh(band)
        return band
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Band update failed"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )


@router.delete("/{band_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_band(
    band_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> None:
    """
    Delete a band.
    
    Args:
        band_id: Band ID
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If band is not found
    """
    band = db.query(Band).filter(Band.id == band_id).first()
    if band is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Band with ID {band_id} not found"
        )
    
    db.delete(band)
    db.commit() 