from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models import User, UserBlog
from app.schemas.user_blog import UserBlog as UserBlogSchema # Assuming schema exists
from app.services.follows import (
    follow_blog_async,
    unfollow_blog_async,
    check_if_following_blog_async,
    get_followed_blogs_async
)
from app.schemas.blogs import Blog as BlogSchema # For list return type

router = APIRouter()

@router.post(
    "/{blog_id}/follow", 
    response_model=UserBlogSchema, 
    status_code=status.HTTP_201_CREATED,
    summary="Follow a blog"
)
async def follow_blog(
    blog_id: int = Path(..., title="The ID of the blog to follow"),
    current_user: User = Depends(deps.get_current_active_user_async),
    db: AsyncSession = Depends(deps.get_async_db)
):
    """Create a relationship indicating the current user follows the specified blog."""
    user_blog = await follow_blog_async(db=db, user_id=current_user.id, blog_id=blog_id)
    return user_blog # Assuming UserBlogSchema can be created from UserBlog model

@router.delete(
    "/{blog_id}/follow", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Unfollow a blog"
)
async def unfollow_blog(
    blog_id: int = Path(..., title="The ID of the blog to unfollow"),
    current_user: User = Depends(deps.get_current_active_user_async),
    db: AsyncSession = Depends(deps.get_async_db)
):
    """Remove the relationship indicating the current user follows the specified blog."""
    await unfollow_blog_async(db=db, user_id=current_user.id, blog_id=blog_id)
    return None # No content response

@router.get(
    "/{blog_id}/is-followed",
    response_model=bool,
    summary="Check if current user follows a blog"
)
async def check_follow_status(
    blog_id: int = Path(..., title="The ID of the blog to check"),
    current_user: User = Depends(deps.get_current_active_user_async),
    db: AsyncSession = Depends(deps.get_async_db)
):
    """Check if the currently authenticated user follows the specified blog."""
    return await check_if_following_blog_async(db=db, user_id=current_user.id, blog_id=blog_id) 