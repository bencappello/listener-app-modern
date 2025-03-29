from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.crud import tag as crud_tag
from app.models.user import User
from app.schemas.tags.tag import Tag, TagCreate, TagUpdate

router = APIRouter()


@router.get("/", response_model=List[Tag])
async def read_tags(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve tags.
    """
    tags = await crud_tag.get_multi(db, skip=skip, limit=limit)
    return tags


@router.post("/", response_model=Tag)
async def create_tag(
    *,
    db: AsyncSession = Depends(deps.get_db),
    tag_in: TagCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new tag.
    Only superusers can create tags.
    """
    # Check if tag with this name already exists
    existing_tag = await crud_tag.get_by_name(db, name=tag_in.name)
    if existing_tag:
        raise HTTPException(status_code=400, detail="Tag with this name already exists")
    
    tag = await crud_tag.create(db, obj_in=tag_in)
    return tag


@router.get("/{tag_id}", response_model=Tag)
async def read_tag(
    *,
    db: AsyncSession = Depends(deps.get_db),
    tag_id: int = Path(..., title="The ID of the tag to get"),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get tag by ID.
    """
    tag = await crud_tag.get(db, id=tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.put("/{tag_id}", response_model=Tag)
async def update_tag(
    *,
    db: AsyncSession = Depends(deps.get_db),
    tag_id: int = Path(..., title="The ID of the tag to update"),
    tag_in: TagUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a tag.
    Only superusers can update tags.
    """
    tag = await crud_tag.get(db, id=tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Check if tag name is being updated and if it already exists
    if tag_in.name and tag_in.name != tag.name:
        existing_tag = await crud_tag.get_by_name(db, name=tag_in.name)
        if existing_tag:
            raise HTTPException(status_code=400, detail="Tag with this name already exists")
    
    tag = await crud_tag.update(db, db_obj=tag, obj_in=tag_in)
    return tag


@router.delete("/{tag_id}", response_model=Tag)
async def delete_tag(
    *,
    db: AsyncSession = Depends(deps.get_db),
    tag_id: int = Path(..., title="The ID of the tag to delete"),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a tag.
    Only superusers can delete tags.
    """
    tag = await crud_tag.get(db, id=tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    tag = await crud_tag.remove(db, id=tag_id)
    return tag 