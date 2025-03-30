from typing import List, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.encoders import jsonable_encoder
from sqlalchemy import select

from app.db.session import get_db, get_async_db
from app.models.band import Band
from app.schemas.bands.band import Band as BandSchema
from app.schemas.bands.band import BandCreate, BandUpdate
from app.api.dependencies import get_current_user, get_current_user_async

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
        # Debug: print the band_data
        print(f"Band data: {band_data}")
        # Handle both new and old Pydantic
        band_dict = getattr(band_data, "model_dump", getattr(band_data, "dict", None))()
        # Filter out fields that don't exist in the Band model
        band_dict = {
            "name": band_dict["name"],
            "description": band_dict["description"],
            "image_url": band_dict["image_url"]
        }
        print(f"Band dict filtered: {band_dict}")
        band = Band(**band_dict)
        db.add(band)
        db.commit()
        db.refresh(band)
        return BandSchema.parse_obj(jsonable_encoder(band))
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Band creation failed"
        )
    except Exception as e:
        import traceback
        print(f"Error creating band: {str(e)}")
        print(traceback.format_exc())
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )


@router.post("/async", response_model=BandSchema, status_code=status.HTTP_201_CREATED)
async def create_band_async(
    band_data: BandCreate,
    current_user = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    Create a new band (async version).
    
    Args:
        band_data: Band creation data
        current_user: Current authenticated user
        db: Async database session
        
    Returns:
        Band: Created band
        
    Raises:
        HTTPException: If band creation fails
    """
    # Check if band with same name already exists
    result = await db.execute(select(Band).filter(Band.name == band_data.name))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Band with name '{band_data.name}' already exists"
        )
    
    # Create new band
    try:
        # Debug: print the band_data
        print(f"Async band data: {band_data}")
        # Handle both new and old Pydantic
        band_dict = getattr(band_data, "model_dump", getattr(band_data, "dict", None))()
        # Filter out fields that don't exist in the Band model
        band_dict = {
            "name": band_dict["name"],
            "description": band_dict["description"],
            "image_url": band_dict["image_url"]
        }
        print(f"Async band dict filtered: {band_dict}")
        band = Band(**band_dict)
        db.add(band)
        await db.commit()
        await db.refresh(band)
        return BandSchema.parse_obj(jsonable_encoder(band))
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Band creation failed"
        )
    except Exception as e:
        import traceback
        print(f"Error creating async band: {str(e)}")
        print(traceback.format_exc())
        await db.rollback()
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
    return [BandSchema.parse_obj(jsonable_encoder(band)) for band in bands]


@router.get("/async", response_model=List[BandSchema])
async def list_bands_async(
    skip: int = 0, 
    limit: int = 100,
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    List all bands (async version).
    
    Args:
        skip: Number of bands to skip
        limit: Maximum number of bands to return
        db: Async database session
        
    Returns:
        List[Band]: List of bands
    """
    result = await db.execute(select(Band).offset(skip).limit(limit))
    bands = result.scalars().all()
    return [BandSchema.parse_obj(jsonable_encoder(band)) for band in bands]


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
    return BandSchema.parse_obj(jsonable_encoder(band))


@router.get("/async/{band_id}", response_model=BandSchema)
async def get_band_async(
    band_id: int,
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    Get a specific band by ID (async version).
    
    Args:
        band_id: Band ID
        db: Async database session
        
    Returns:
        Band: Band with specified ID
        
    Raises:
        HTTPException: If band is not found
    """
    result = await db.execute(select(Band).filter(Band.id == band_id))
    band = result.scalars().first()
    if band is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Band with ID {band_id} not found"
        )
    return BandSchema.parse_obj(jsonable_encoder(band))


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
    # Handle both new and old Pydantic
    if hasattr(band_data, "model_dump"):
        update_data = band_data.model_dump(exclude_unset=True)
    else:
        update_data = band_data.dict(exclude_unset=True)
        
    for key, value in update_data.items():
        if value is not None:
            setattr(band, key, value)
    
    try:
        db.commit()
        db.refresh(band)
        return BandSchema.parse_obj(jsonable_encoder(band))
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


@router.put("/async/{band_id}", response_model=BandSchema)
async def update_band_async(
    band_id: int,
    band_data: BandUpdate,
    current_user = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    Update a band (async version).
    
    Args:
        band_id: Band ID
        band_data: Band update data
        current_user: Current authenticated user
        db: Async database session
        
    Returns:
        Band: Updated band
        
    Raises:
        HTTPException: If band is not found or update fails
    """
    result = await db.execute(select(Band).filter(Band.id == band_id))
    band = result.scalars().first()
    if band is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Band with ID {band_id} not found"
        )
    
    # Update band attributes
    # Handle both new and old Pydantic
    if hasattr(band_data, "model_dump"):
        update_data = band_data.model_dump(exclude_unset=True)
    else:
        update_data = band_data.dict(exclude_unset=True)
        
    for key, value in update_data.items():
        if value is not None:
            setattr(band, key, value)
    
    try:
        await db.commit()
        await db.refresh(band)
        return BandSchema.parse_obj(jsonable_encoder(band))
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Band update failed"
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )


@router.delete("/{band_id}", response_model=BandSchema, status_code=status.HTTP_200_OK)
async def delete_band(
    band_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Delete a band.
    
    Args:
        band_id: Band ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Band: Deleted band
        
    Raises:
        HTTPException: If band is not found
    """
    band = db.query(Band).filter(Band.id == band_id).first()
    if band is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Band with ID {band_id} not found"
        )
    
    band_data = BandSchema.parse_obj(jsonable_encoder(band))
    db.delete(band)
    db.commit()
    return band_data


@router.delete("/async/{band_id}", response_model=BandSchema, status_code=status.HTTP_200_OK)
async def delete_band_async(
    band_id: int,
    current_user = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    Delete a band (async version).
    
    Args:
        band_id: Band ID
        current_user: Current authenticated user
        db: Async database session
        
    Returns:
        Band: Deleted band
        
    Raises:
        HTTPException: If band is not found
    """
    result = await db.execute(select(Band).filter(Band.id == band_id))
    band = result.scalars().first()
    if band is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Band with ID {band_id} not found"
        )
    
    band_data = BandSchema.parse_obj(jsonable_encoder(band))
    await db.delete(band)
    await db.commit()
    return band_data 