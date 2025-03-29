from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.users.user import User as UserSchema
from app.api.v1.users.favorites import router as favorites_router

router = APIRouter()

# Include favorites router
router.include_router(
    favorites_router,
    prefix="/me/favorites",
    tags=["favorites"]
)


@router.get("/me", response_model=UserSchema)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get current authenticated user information.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: Current user information
    """
    return current_user