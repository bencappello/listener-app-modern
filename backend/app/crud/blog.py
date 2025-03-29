from typing import List, Optional, Union, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.blog import Blog
from app.schemas.blogs.blog import BlogCreate, BlogUpdate


class CRUDBlog(CRUDBase[Blog, BlogCreate, BlogUpdate]):
    """CRUD operations for Blog model."""
    
    async def get_by_name(self, db_session: AsyncSession, *, name: str) -> Optional[Blog]:
        """Get a blog by name."""
        result = await db_session.execute(select(self.model).where(self.model.name == name))
        return result.scalars().first()
    
    def get_by_name_sync(self, db_session: Session, *, name: str) -> Optional[Blog]:
        """Get a blog by name (synchronous version)."""
        return db_session.execute(select(self.model).where(self.model.name == name)).scalars().first()
    
    async def get_by_url(self, db_session: AsyncSession, *, url: str) -> Optional[Blog]:
        """Get a blog by URL."""
        result = await db_session.execute(select(self.model).where(self.model.url == url))
        return result.scalars().first()
    
    def get_by_url_sync(self, db_session: Session, *, url: str) -> Optional[Blog]:
        """Get a blog by URL (synchronous version)."""
        return db_session.execute(select(self.model).where(self.model.url == url)).scalars().first()
    
    async def get_active_blogs(self, db_session: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[Blog]:
        """Get all active blogs."""
        result = await db_session.execute(
            select(self.model)
            .where(self.model.is_active == True)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    def get_active_blogs_sync(self, db_session: Session, *, skip: int = 0, limit: int = 100) -> List[Blog]:
        """Get all active blogs (synchronous version)."""
        return db_session.execute(
            select(self.model)
            .where(self.model.is_active == True)
            .offset(skip)
            .limit(limit)
        ).scalars().all()


blog = CRUDBlog(Blog) 