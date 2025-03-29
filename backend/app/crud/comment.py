from typing import List, Optional, Union, Dict, Any, Literal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.comment import Comment
from app.schemas.comments.comment import CommentCreate, CommentUpdate


class CRUDComment(CRUDBase[Comment, CommentCreate, CommentUpdate]):
    """CRUD operations for Comment model."""
    
    async def create_with_user(
        self, db_session: AsyncSession, *, obj_in: CommentCreate, user_id: int
    ) -> Comment:
        """Create a new comment with user ID."""
        comment_data = obj_in.dict()
        
        # Determine target type
        target_type = None
        if obj_in.song_id:
            target_type = "song"
        elif obj_in.band_id:
            target_type = "band"
        elif obj_in.blog_id:
            target_type = "blog"
        
        db_obj = Comment(
            **comment_data,
            user_id=user_id,
            target_type=target_type
        )
        db_session.add(db_obj)
        await db_session.commit()
        await db_session.refresh(db_obj)
        return db_obj
    
    def create_with_user_sync(
        self, db_session: Session, *, obj_in: CommentCreate, user_id: int
    ) -> Comment:
        """Create a new comment with user ID (synchronous version)."""
        comment_data = obj_in.dict()
        
        # Determine target type
        target_type = None
        if obj_in.song_id:
            target_type = "song"
        elif obj_in.band_id:
            target_type = "band"
        elif obj_in.blog_id:
            target_type = "blog"
        
        db_obj = Comment(
            **comment_data,
            user_id=user_id,
            target_type=target_type
        )
        db_session.add(db_obj)
        db_session.commit()
        db_session.refresh(db_obj)
        return db_obj
    
    async def get_by_target(
        self, 
        db_session: AsyncSession, 
        *, 
        target_type: Literal["song", "band", "blog"],
        target_id: int,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Comment]:
        """Get comments by target type and ID."""
        # Define the filter based on target type
        if target_type == "song":
            filter_condition = self.model.song_id == target_id
        elif target_type == "band":
            filter_condition = self.model.band_id == target_id
        elif target_type == "blog":
            filter_condition = self.model.blog_id == target_id
        else:
            raise ValueError(f"Invalid target type: {target_type}")
        
        result = await db_session.execute(
            select(self.model)
            .where(self.model.target_type == target_type)
            .where(filter_condition)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    def get_by_target_sync(
        self, 
        db_session: Session, 
        *, 
        target_type: Literal["song", "band", "blog"],
        target_id: int,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Comment]:
        """Get comments by target type and ID (synchronous version)."""
        # Define the filter based on target type
        if target_type == "song":
            filter_condition = self.model.song_id == target_id
        elif target_type == "band":
            filter_condition = self.model.band_id == target_id
        elif target_type == "blog":
            filter_condition = self.model.blog_id == target_id
        else:
            raise ValueError(f"Invalid target type: {target_type}")
        
        return db_session.execute(
            select(self.model)
            .where(self.model.target_type == target_type)
            .where(filter_condition)
            .offset(skip)
            .limit(limit)
        ).scalars().all()
    
    async def get_by_user(
        self, db_session: AsyncSession, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Comment]:
        """Get comments by user ID."""
        result = await db_session.execute(
            select(self.model)
            .where(self.model.user_id == user_id)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    def get_by_user_sync(
        self, db_session: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Comment]:
        """Get comments by user ID (synchronous version)."""
        return db_session.execute(
            select(self.model)
            .where(self.model.user_id == user_id)
            .offset(skip)
            .limit(limit)
        ).scalars().all()


comment = CRUDComment(Comment) 