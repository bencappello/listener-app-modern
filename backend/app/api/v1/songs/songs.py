from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.crud import song as crud_song
from app.crud import band as crud_band
from app.crud import blog as crud_blog
from app.models.user import User
from app.schemas.songs.song import Song, SongCreate, SongUpdate

router = APIRouter()

@router.get("/", response_model=List[Song])
async def read_songs(
    db: AsyncSession = Depends(deps.get_async_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user_async),
) -> Any:
    """
    Retrieve songs.
    """
    songs = await crud_song.get_multi_async(db, skip=skip, limit=limit)
    return songs

@router.post("/", response_model=Song, status_code=201)
async def create_song(
    *,
    db: AsyncSession = Depends(deps.get_async_db),
    song_in: SongCreate,
    current_user: User = Depends(deps.get_current_active_superuser_async),
) -> Any:
    """
    Create new song.
    Only superusers can create songs.
    """
    # Check if band exists
    band = await crud_band.get_async(db, id=song_in.band_id)
    if not band:
        raise HTTPException(status_code=404, detail="Band not found")

    # Check if blog exists
    blog = await crud_blog.get_async(db, id=song_in.blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    song = await crud_song.create_async(db, obj_in=song_in)
    return song

@router.get("/{song_id}", response_model=Song)
async def read_song(
    *,
    db: AsyncSession = Depends(deps.get_async_db),
    song_id: int = Path(..., title="The ID of the song to get"),
    current_user: User = Depends(deps.get_current_user_async),
) -> Any:
    """
    Get song by ID.
    """
    song = await crud_song.get_async(db, id=song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song

@router.put("/{song_id}", response_model=Song)
async def update_song(
    *,
    db: AsyncSession = Depends(deps.get_async_db),
    song_id: int = Path(..., title="The ID of the song to update"),
    song_in: SongUpdate,
    current_user: User = Depends(deps.get_current_active_superuser_async),
) -> Any:
    """
    Update a song.
    Only superusers can update songs.
    """
    song = await crud_song.get_async(db, id=song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    # If band_id is being updated, check if the new band exists
    if song_in.band_id and song_in.band_id != song.band_id:
        band = await crud_band.get_async(db, id=song_in.band_id)
        if not band:
            raise HTTPException(status_code=404, detail="Band not found")

    # If blog_id is being updated, check if the new blog exists
    if song_in.blog_id and song_in.blog_id != song.blog_id:
        blog = await crud_blog.get_async(db, id=song_in.blog_id)
        if not blog:
            raise HTTPException(status_code=404, detail="Blog not found")

    song = await crud_song.update_async(db, db_obj=song, obj_in=song_in)
    return song

@router.delete("/{song_id}", response_model=Song)
async def delete_song(
    *,
    db: AsyncSession = Depends(deps.get_async_db),
    song_id: int = Path(..., title="The ID of the song to delete"),
    current_user: User = Depends(deps.get_current_active_superuser_async),
) -> Any:
    """
    Delete a song.
    Only superusers can delete songs.
    """
    song = await crud_song.get_async(db, id=song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    song = await crud_song.remove_async(db, id=song_id)
    return song 