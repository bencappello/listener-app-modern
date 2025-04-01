from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.encoders import jsonable_encoder

from app.api.dependencies import get_current_user, get_current_user_async, get_async_db
from app.db.session import get_db
from app.models.user import User
from app.schemas.users.user import User as UserSchema
from app.api.v1.users.favorites import router as favorites_router
from app.api.v1.users.follows_api import router as follows_router
from app.services.follows import get_followed_blogs_async, get_followed_users_async
from app.schemas.blogs import Blog as BlogSchema

router = APIRouter()

# Include favorites router
router.include_router(
    favorites_router,
    prefix="/me/favorites",
    tags=["favorites"]
)

# Include user follows router (actions on other users)
router.include_router(follows_router, tags=["user follows"])

# Add endpoint for followed blogs
@router.get("/me/followed-blogs", response_model=List[BlogSchema])
async def read_followed_blogs(
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db)
):
    """Retrieve blogs followed by the current user."""
    return await get_followed_blogs_async(db=db, user_id=current_user.id)

# Add endpoint for followed users
@router.get("/me/followed-users", response_model=List[UserSchema])
async def read_followed_users(
    current_user: User = Depends(get_current_user_async),
    db: AsyncSession = Depends(get_async_db)
):
    """Retrieve users followed by the current user."""
    return await get_followed_users_async(db=db, user_id=current_user.id)

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