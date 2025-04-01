from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, models, schemas
from app.api.dependencies import get_async_db, get_current_user_async, get_current_active_user_async, get_current_active_superuser_async
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[schemas.Song])
async def read_songs(
    db: AsyncSession = Depends(get_async_db),
    skip: int = 0,
    limit: int = 10,
    current_user: models.User = Depends(get_current_user_async),
) -> Any:
    """
    Retrieve all songs with pagination.
    """
    songs = await crud.song.get_multi(db, skip=skip, limit=limit)
    return songs


@router.post("/", response_model=schemas.Song, status_code=status.HTTP_201_CREATED)
async def create_song(
    *,
    db: AsyncSession = Depends(get_async_db),
    song_in: schemas.SongCreate,
    current_user: models.User = Depends(get_current_active_superuser_async),
) -> Any:
    """
    Create new song (admin only).
    """
    # Validate band_id if provided
    if song_in.band_id:
        band = await crud.band.get(db=db, id=song_in.band_id)
        if not band:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Band with id {song_in.band_id} not found",
            )
    # Validate blog_id if provided
    if song_in.blog_id:
        blog = await crud.blog.get(db=db, id=song_in.blog_id)
        if not blog:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Blog with id {song_in.blog_id} not found",
            )
            
    song = await crud.song.create(db=db, obj_in=song_in)
    return song


@router.get("/search", response_model=List[schemas.Song])
async def search_songs(
    *,
    db: AsyncSession = Depends(get_async_db),
    query: str = Query(..., min_length=1),
    band_id: Optional[int] = None,
    blog_id: Optional[int] = None,
    release_year: Optional[int] = None,
    min_duration: Optional[int] = None,
    max_duration: Optional[int] = None,
    tag_ids: List[int] = Query(None),
    sort_by: Optional[str] = Query(None, regex="^(popularity|newest|oldest)$"),
    skip: int = 0,
    limit: int = 10,
    current_user: models.User = Depends(get_current_user_async),
) -> Any:
    """
    Search for songs based on query and optional filters.
    """
    songs = await crud.song.search(
        db=db,
        query=query,
        band_id=band_id,
        blog_id=blog_id,
        release_year=release_year,
        min_duration=min_duration,
        max_duration=max_duration,
        tag_ids=tag_ids,
        sort_by=sort_by,
        skip=skip,
        limit=limit,
    )
    return songs


@router.get("/popular", response_model=List[schemas.Song])
async def read_popular_songs(
    *,
    db: AsyncSession = Depends(get_async_db),
    time_period: str = Query("all_time", regex="^(week|month|year|all_time)$"),
    skip: int = 0,
    limit: int = 10,
    current_user: models.User = Depends(get_current_user_async),
) -> Any:
    """
    Get the most popular songs based on favorites count.
    """
    if time_period not in ["week", "month", "year", "all_time"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid time period. Must be 'week', 'month', 'year', or 'all_time'.",
        )
    
    songs = await crud.song.get_popular_songs(
        db=db,
        time_period=time_period,
        skip=skip,
        limit=limit,
    )
    return songs


@router.get("/feed", response_model=List[schemas.Song])
async def read_user_feed(
    *,
    db: AsyncSession = Depends(get_async_db),
    skip: int = 0,
    limit: int = 10,
    current_user: models.User = Depends(get_current_active_user_async),
) -> Any:
    """
    Get personalized feed of songs for the current user.
    """
    songs = await crud.song.get_feed_for_user(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
    )
    return songs


@router.get("/{song_id}", response_model=schemas.SongWithDetails)
async def read_song(
    *,
    db: AsyncSession = Depends(get_async_db),
    song_id: int,
    current_user: models.User = Depends(get_current_user_async),
) -> Any:
    """
    Get song by ID with additional details.
    """
    song = await crud.song.get_song_with_details(
        db=db, id=song_id, user_id=current_user.id
    )
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found",
        )
    return song


@router.put("/{song_id}", response_model=schemas.Song)
async def update_song(
    *,
    db: AsyncSession = Depends(get_async_db),
    song_id: int,
    song_in: schemas.SongUpdate,
    current_user: models.User = Depends(get_current_active_superuser_async),
) -> Any:
    """
    Update a song (admin only).
    """
    song = await crud.song.get(db=db, id=song_id)
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found",
        )
    song = await crud.song.update(db=db, db_obj=song, obj_in=song_in)
    return song


@router.delete("/{song_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_song(
    *,
    db: AsyncSession = Depends(get_async_db),
    song_id: int,
    current_user: models.User = Depends(get_current_active_superuser_async),
) -> None:
    """
    Delete a song (admin only).
    """
    song = await crud.song.get(db=db, id=song_id)
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found",
        )
    await crud.song.remove(db=db, id=song_id) 