from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models import User, UserFollow
from app.schemas.user_follow import UserFollow as UserFollowSchema # Assuming schema exists
from app.services.follows import (
    follow_user_async,
    unfollow_user_async,
    check_if_following_user_async,
    get_followed_users_async,
    get_user_followers_async
)
from app.schemas.users.user import User as UserSchema # For list return type

router = APIRouter()

@router.post(
    "/{user_id}/follow", 
    response_model=UserFollowSchema, # Need a schema for UserFollow
    status_code=status.HTTP_201_CREATED,
    summary="Follow a user"
)
async def follow_user(
    user_id: int = Path(..., title="The ID of the user to follow"),
    current_user: User = Depends(deps.get_current_active_user_async),
    db: AsyncSession = Depends(deps.get_async_db)
):
    """Make the current user follow the specified user."""
    user_follow = await follow_user_async(db=db, follower_id=current_user.id, followed_id=user_id)
    return user_follow # Need UserFollowSchema

@router.delete(
    "/{user_id}/follow", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Unfollow a user"
)
async def unfollow_user(
    user_id: int = Path(..., title="The ID of the user to unfollow"),
    current_user: User = Depends(deps.get_current_active_user_async),
    db: AsyncSession = Depends(deps.get_async_db)
):
    """Make the current user unfollow the specified user."""
    await unfollow_user_async(db=db, follower_id=current_user.id, followed_id=user_id)
    return None

@router.get(
    "/{user_id}/is-followed",
    response_model=bool,
    summary="Check if current user follows another user"
)
async def check_user_follow_status(
    user_id: int = Path(..., title="The ID of the user to check"),
    current_user: User = Depends(deps.get_current_active_user_async),
    db: AsyncSession = Depends(deps.get_async_db)
):
    """Check if the currently authenticated user follows the specified user."""
    return await check_if_following_user_async(db=db, follower_id=current_user.id, followed_id=user_id)

@router.get(
    "/{user_id}/followers",
    response_model=List[UserSchema],
    summary="Get followers of a user"
)
async def get_followers(
    user_id: int = Path(..., title="The ID of the user whose followers to retrieve"),
    # No auth needed to see public followers list? Or use get_current_user_async if auth required.
    db: AsyncSession = Depends(deps.get_async_db)
):
    """Get the list of users following the specified user."""
    return await get_user_followers_async(db=db, user_id=user_id)

# Endpoint for getting users followed by the current user is in users/endpoints.py 