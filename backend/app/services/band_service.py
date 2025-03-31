from typing import Optional, List, Union, Dict, Any
from datetime import datetime

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from fastapi.encoders import jsonable_encoder

from app.models.band import Band
from app.schemas.bands.band import BandCreate, BandUpdate


class CRUDBand:
    """CRUD operations for Band model."""

    def get(self, db: Session, id: int) -> Optional[Band]:
        """Get a band by ID."""
        return db.query(Band).filter(Band.id == id).first()

    def get_by_name(self, db: Session, *, name: str) -> Optional[Band]:
        """Get a band by name."""
        return db.query(Band).filter(Band.name == name).first()

    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Band]:
        """Get multiple bands with pagination."""
        return db.query(Band).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: BandCreate) -> Band:
        """Create a new band, ensuring name uniqueness."""
        # Check if band name already exists
        existing_band = self.get_by_name(db, name=obj_in.name)
        if existing_band:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="A band with this name already exists."
            )
        
        # Create the new band object
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = Band(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: Optional[Band], obj_in: Union[BandUpdate, Dict[str, Any]]
    ) -> Optional[Band]:
        """Update an existing band."""
        # Check if the object exists first
        if not db_obj:
            return None # Or raise HTTPException(404)

        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            # Use model_dump for Pydantic v2 compatibility
            update_data = obj_in.model_dump(exclude_unset=True) 

        # Update fields
        for field, value in update_data.items():
            # Ensure the field exists on the model before setting
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)

        # Explicitly set updated_at to ensure it's always updated
        db_obj.updated_at = datetime.utcnow()
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> Band:
        """Remove a band by ID."""
        obj = db.query(Band).get(id)
        if not obj:
             raise HTTPException(
                 status_code=status.HTTP_404_NOT_FOUND,
                 detail=f"Band with id {id} not found."
             )
        db.delete(obj)
        db.commit()
        return obj


# Instantiate the service
band_service = CRUDBand() 