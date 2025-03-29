from typing import List, Optional, Union, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.tag import Tag
from app.schemas.tags.tag import TagCreate, TagUpdate


class CRUDTag(CRUDBase[Tag, TagCreate, TagUpdate]):
    """CRUD operations for Tag model."""
    
    async def get_by_name(self, db_session: AsyncSession, *, name: str) -> Optional[Tag]:
        """Get a tag by name."""
        result = await db_session.execute(select(self.model).where(self.model.name == name))
        return result.scalars().first()
    
    def get_by_name_sync(self, db_session: Session, *, name: str) -> Optional[Tag]:
        """Get a tag by name (synchronous version)."""
        return db_session.execute(select(self.model).where(self.model.name == name)).scalars().first()
    
    async def get_or_create(self, db_session: AsyncSession, *, name: str, description: str = None) -> Tag:
        """Get a tag by name or create it if it doesn't exist."""
        tag = await self.get_by_name(db_session, name=name)
        if not tag:
            tag_in = TagCreate(name=name, description=description)
            tag = await self.create(db_session, obj_in=tag_in)
        return tag
    
    def get_or_create_sync(self, db_session: Session, *, name: str, description: str = None) -> Tag:
        """Get a tag by name or create it if it doesn't exist (synchronous version)."""
        tag = self.get_by_name_sync(db_session, name=name)
        if not tag:
            tag_in = TagCreate(name=name, description=description)
            tag = self.create_sync(db_session, obj_in=tag_in)
        return tag


tag = CRUDTag(Tag) 