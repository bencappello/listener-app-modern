from typing import Any, List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.crud import comment as crud_comment
from app.models.user import User
from app.schemas.comments.comment import Comment, CommentCreate, CommentUpdate

router = APIRouter()


@router.get("/", response_model=List[Comment])
async def read_comments(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve comments.
    """
    comments = await crud_comment.get_multi(db, skip=skip, limit=limit)
    return comments


@router.post("/", response_model=Comment)
async def create_comment(
    *,
    db: AsyncSession = Depends(deps.get_db),
    comment_in: CommentCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new comment.
    """
    comment = await crud_comment.create_with_user(
        db, obj_in=comment_in, user_id=current_user.id
    )
    return comment


@router.get("/by-target/{target_type}/{target_id}", response_model=List[Comment])
async def read_comments_by_target(
    *,
    db: AsyncSession = Depends(deps.get_db),
    target_type: str = Path(..., title="The target type", regex="^(song|band|blog)$"),
    target_id: int = Path(..., title="The target ID"),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve comments by target type and ID.
    """
    comments = await crud_comment.get_by_target(
        db, target_type=target_type, target_id=target_id, skip=skip, limit=limit
    )
    return comments


@router.get("/by-user/{user_id}", response_model=List[Comment])
async def read_comments_by_user(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_id: int = Path(..., title="The user ID"),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve comments by user ID.
    """
    comments = await crud_comment.get_by_user(
        db, user_id=user_id, skip=skip, limit=limit
    )
    return comments


@router.get("/{comment_id}", response_model=Comment)
async def read_comment(
    *,
    db: AsyncSession = Depends(deps.get_db),
    comment_id: int = Path(..., title="The ID of the comment to get"),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get comment by ID.
    """
    comment = await crud_comment.get(db, id=comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment


@router.put("/{comment_id}", response_model=Comment)
async def update_comment(
    *,
    db: AsyncSession = Depends(deps.get_db),
    comment_id: int = Path(..., title="The ID of the comment to update"),
    comment_in: CommentUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a comment.
    Users can only update their own comments.
    """
    comment = await crud_comment.get(db, id=comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user is the comment author or superuser
    if comment.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    comment = await crud_comment.update(db, db_obj=comment, obj_in=comment_in)
    return comment


@router.delete("/{comment_id}", response_model=Comment)
async def delete_comment(
    *,
    db: AsyncSession = Depends(deps.get_db),
    comment_id: int = Path(..., title="The ID of the comment to delete"),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a comment.
    Users can only delete their own comments.
    """
    comment = await crud_comment.get(db, id=comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user is the comment author or superuser
    if comment.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    comment = await crud_comment.remove(db, id=comment_id)
    return comment 