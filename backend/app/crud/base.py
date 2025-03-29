from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.future import select as future_select

from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Base class for CRUD operations.
    """
    def __init__(self, model: Type[ModelType]):
        """
        Initialize with SQLAlchemy model.
        
        Args:
            model: SQLAlchemy model class
        """
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        """
        Get by ID.
        
        Args:
            db: Database session
            id: ID to get
            
        Returns:
            Optional[ModelType]: Object if found, else None
        """
        return db.query(self.model).filter(self.model.id == id).first()
    
    async def get_async(self, db: AsyncSession, id: Any) -> Optional[ModelType]:
        """
        Get by ID (async version).
        
        Args:
            db: Async database session
            id: ID to get
            
        Returns:
            Optional[ModelType]: Object if found, else None
        """
        result = await db.execute(future_select(self.model).filter(self.model.id == id))
        return result.scalars().first()

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        """
        Get multiple objects.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to get
            
        Returns:
            List[ModelType]: List of objects
        """
        return db.query(self.model).offset(skip).limit(limit).all()
    
    async def get_multi_async(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        """
        Get multiple objects (async version).
        
        Args:
            db: Async database session
            skip: Number of records to skip
            limit: Maximum number of records to get
            
        Returns:
            List[ModelType]: List of objects
        """
        result = await db.execute(future_select(self.model).offset(skip).limit(limit))
        return result.scalars().all()

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        """
        Create new object.
        
        Args:
            db: Database session
            obj_in: Object data to create
            
        Returns:
            ModelType: Created object
        """
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    async def create_async(self, db: AsyncSession, *, obj_in: CreateSchemaType) -> ModelType:
        """
        Create new object (async version).
        
        Args:
            db: Async database session
            obj_in: Object data to create
            
        Returns:
            ModelType: Created object
        """
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        """
        Update object.
        
        Args:
            db: Database session
            db_obj: Object to update
            obj_in: Update data
            
        Returns:
            ModelType: Updated object
        """
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    async def update_async(
        self,
        db: AsyncSession,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        """
        Update object (async version).
        
        Args:
            db: Async database session
            db_obj: Object to update
            obj_in: Update data
            
        Returns:
            ModelType: Updated object
        """
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> ModelType:
        """
        Remove object.
        
        Args:
            db: Database session
            id: ID to remove
            
        Returns:
            ModelType: Removed object
        """
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj
    
    async def remove_async(self, db: AsyncSession, *, id: int) -> ModelType:
        """
        Remove object (async version).
        
        Args:
            db: Async database session
            id: ID to remove
            
        Returns:
            ModelType: Removed object
        """
        result = await db.execute(future_select(self.model).filter(self.model.id == id))
        obj = result.scalar_one_or_none()
        await db.delete(obj)
        await db.commit()
        return obj 