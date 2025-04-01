from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func, update, and_, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User, Blog, UserBlog, Song, Band, UserBand, UserFollow # Import necessary models
from app.schemas.blogs import Blog as BlogSchema # Use Blog schema for return type
from app.schemas.users.user import User as UserSchema # Add User schema

# === Blog Follows ===

async def follow_blog_async(db: AsyncSession, *, user_id: int, blog_id: int) -> UserBlog:
    """Create or update a follow relationship between a user and a blog."""
    # Check if blog exists
    result = await db.execute(select(Blog).where(Blog.id == blog_id))
    blog = result.scalar_one_or_none()
    if not blog:
        raise HTTPException(status_code=404, detail=f"Blog with id {blog_id} not found")

    # Check if relationship already exists
    result = await db.execute(
        select(UserBlog).where(
            UserBlog.user_id == user_id,
            UserBlog.blog_id == blog_id
        )
    )
    user_blog = result.scalar_one_or_none()

    if user_blog:
        # Update existing relationship if not already following
        if not user_blog.is_following:
            user_blog.is_following = True
            await db.commit()
            await db.refresh(user_blog)
    else:
        # Create new relationship
        user_blog = UserBlog(user_id=user_id, blog_id=blog_id, is_following=True)
        await db.add(user_blog)
        await db.commit()
        await db.refresh(user_blog)
    
    return user_blog

async def unfollow_blog_async(db: AsyncSession, *, user_id: int, blog_id: int) -> None:
    """Remove a follow relationship between a user and a blog."""
    result = await db.execute(
        select(UserBlog).where(
            UserBlog.user_id == user_id,
            UserBlog.blog_id == blog_id
        )
    )
    user_blog = result.scalar_one_or_none()

    if not user_blog or not user_blog.is_following:
        # Nothing to remove or already not following
        return

    # Set is_following to False (soft delete)
    user_blog.is_following = False
    await db.commit()

async def get_followed_blogs_async(db: AsyncSession, *, user_id: int) -> List[BlogSchema]:
    """Retrieve all blogs followed by a user."""
    result = await db.execute(
        select(Blog).join(
            UserBlog, and_(
                UserBlog.blog_id == Blog.id,
                UserBlog.user_id == user_id,
                UserBlog.is_following == True
            )
        )
    )
    blogs = result.scalars().all()
    # Convert to schema before returning
    return [BlogSchema.from_orm(blog) for blog in blogs]

async def check_if_following_blog_async(db: AsyncSession, *, user_id: int, blog_id: int) -> bool:
    """Check if a user is following a specific blog."""
    result = await db.execute(
        select(UserBlog).where(
            UserBlog.user_id == user_id,
            UserBlog.blog_id == blog_id,
            UserBlog.is_following == True
        )
    )
    user_blog = result.scalar_one_or_none()
    return user_blog is not None

# === User Follows ===

async def follow_user_async(db: AsyncSession, *, follower_id: int, followed_id: int) -> UserFollow:
    """Create or update a follow relationship between two users."""
    if follower_id == followed_id:
        raise HTTPException(status_code=400, detail="Users cannot follow themselves")
        
    # Check if followed user exists
    result = await db.execute(select(User).where(User.id == followed_id))
    followed_user = result.scalar_one_or_none()
    if not followed_user:
        raise HTTPException(status_code=404, detail=f"User with id {followed_id} not found")

    # Check if relationship already exists
    result = await db.execute(
        select(UserFollow).where(
            UserFollow.follower_id == follower_id,
            UserFollow.followed_id == followed_id
        )
    )
    user_follow = result.scalar_one_or_none()

    if user_follow:
        # Update existing relationship if not already following
        if not user_follow.is_following:
            user_follow.is_following = True
            await db.commit()
            await db.refresh(user_follow)
    else:
        # Create new relationship
        user_follow = UserFollow(follower_id=follower_id, followed_id=followed_id, is_following=True)
        await db.add(user_follow)
        await db.commit()
        await db.refresh(user_follow)
    
    return user_follow

async def unfollow_user_async(db: AsyncSession, *, follower_id: int, followed_id: int) -> None:
    """Remove a follow relationship between two users."""
    result = await db.execute(
        select(UserFollow).where(
            UserFollow.follower_id == follower_id,
            UserFollow.followed_id == followed_id
        )
    )
    user_follow = result.scalar_one_or_none()

    if not user_follow or not user_follow.is_following:
        # Nothing to remove or already not following
        return

    # Set is_following to False (soft delete)
    user_follow.is_following = False
    await db.commit()

async def get_followed_users_async(db: AsyncSession, *, user_id: int) -> List[UserSchema]:
    """Retrieve all users followed by a specific user."""
    result = await db.execute(
        select(User).join(
            UserFollow, and_(
                UserFollow.followed_id == User.id, # User is the one being followed
                UserFollow.follower_id == user_id, # By the specified user_id
                UserFollow.is_following == True
            )
        )
    )
    users = result.scalars().all()
    # Convert to schema before returning
    return [UserSchema.from_orm(user) for user in users]

async def get_user_followers_async(db: AsyncSession, *, user_id: int) -> List[UserSchema]:
    """Retrieve all users following a specific user."""
    result = await db.execute(
        select(User).join(
            UserFollow, and_(
                UserFollow.follower_id == User.id, # User is the one doing the following
                UserFollow.followed_id == user_id, # Of the specified user_id
                UserFollow.is_following == True
            )
        )
    )
    users = result.scalars().all()
    # Convert to schema before returning
    return [UserSchema.from_orm(user) for user in users]

async def check_if_following_user_async(db: AsyncSession, *, follower_id: int, followed_id: int) -> bool:
    """Check if follower_id is following followed_id."""
    result = await db.execute(
        select(UserFollow).where(
            UserFollow.follower_id == follower_id,
            UserFollow.followed_id == followed_id,
            UserFollow.is_following == True
        )
    )
    user_follow = result.scalar_one_or_none()
    return user_follow is not None

# TODO: Add synchronous versions if needed
# TODO: Add similar functions for following Bands

# TODO: Add similar functions for following Bands and Users 