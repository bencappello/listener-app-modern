from datetime import datetime
from typing import Any

from sqlalchemy import Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.declarative import as_declarative, declared_attr


@as_declarative()
class Base:
    """Base class for all models."""
    
    # Allow unmapped attributes for SQLAlchemy 2.0 compatibility
    __allow_unmapped__ = True
    
    id: Any
    __name__: str
    
    # Generate __tablename__ automatically based on class name
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
    
    # Common columns for all models - using Mapped and mapped_column
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        nullable=False
    ) 