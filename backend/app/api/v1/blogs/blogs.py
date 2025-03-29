from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.crud import blog as crud_blog
from app.models.user import User
from app.schemas.blogs.blog import Blog, BlogCreate, BlogUpdate

router = APIRouter()


@router.get("/", response_model=List[Blog])
async def read_blogs(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve blogs.
    """
    blogs = await crud_blog.get_multi(db, skip=skip, limit=limit)
    return blogs


@router.post("/", response_model=Blog)
async def create_blog(
    *,
    db: AsyncSession = Depends(deps.get_db),
    blog_in: BlogCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new blog.
    Only superusers can create blogs.
    """
    blog = await crud_blog.create(db, obj_in=blog_in)
    return blog


@router.get("/active", response_model=List[Blog])
async def read_active_blogs(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve active blogs.
    """
    blogs = await crud_blog.get_active_blogs(db, skip=skip, limit=limit)
    return blogs


@router.get("/{blog_id}", response_model=Blog)
async def read_blog(
    *,
    db: AsyncSession = Depends(deps.get_db),
    blog_id: int = Path(..., title="The ID of the blog to get"),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get blog by ID.
    """
    blog = await crud_blog.get(db, id=blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog


@router.put("/{blog_id}", response_model=Blog)
async def update_blog(
    *,
    db: AsyncSession = Depends(deps.get_db),
    blog_id: int = Path(..., title="The ID of the blog to update"),
    blog_in: BlogUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a blog.
    Only superusers can update blogs.
    """
    blog = await crud_blog.get(db, id=blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    blog = await crud_blog.update(db, db_obj=blog, obj_in=blog_in)
    return blog


@router.delete("/{blog_id}", response_model=Blog)
async def delete_blog(
    *,
    db: AsyncSession = Depends(deps.get_db),
    blog_id: int = Path(..., title="The ID of the blog to delete"),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a blog.
    Only superusers can delete blogs.
    """
    blog = await crud_blog.get(db, id=blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    blog = await crud_blog.remove(db, id=blog_id)
    return blog 