from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.encoders import jsonable_encoder

from app.api.dependencies import get_current_user, get_current_user_async
from app.db.session import get_db, get_async_db
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
    return UserSchema.parse_obj(jsonable_encoder(current_user))


@router.get("/me/async", response_model=UserSchema)
async def get_current_user_info_async(
    current_user: User = Depends(get_current_user_async)
) -> Any:
    """
    Get current authenticated user information (async version).
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: Current user information
    """
    return UserSchema.parse_obj(jsonable_encoder(current_user))