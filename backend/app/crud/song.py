from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text, func
from sqlalchemy import select

from app.crud.base import CRUDBase
from app.models.song import Song
from app.models.user_song import UserSong
from app.models.band import Band
from app.models.blog import Blog
from app.models.tag import Tag
from app.models.user_band import UserBand
from app.models.user_blog import UserBlog
from app.schemas.songs.song import SongCreate, SongUpdate


class CRUDSong(CRUDBase[Song, SongCreate, SongUpdate]):
    async def search(
        self,
        db: AsyncSession,
        *,
        query: str,
        band_id: Optional[int] = None,
        blog_id: Optional[int] = None,
        release_year: Optional[int] = None,
        min_duration: Optional[int] = None,
        max_duration: Optional[int] = None,
        tag_ids: Optional[List[int]] = None,
        sort_by: Optional[str] = None,
        skip: int = 0,
        limit: int = 10,
    ) -> List[Song]:
        """
        Search for songs using a text query with optional filters.
        Searches through song titles, band names, blog names, and tags.
        """
        # Build the base query
        stmt = select(self.model).distinct()
        
        # Base search query across multiple fields
        search_terms = [f"%{term}%" for term in query.split()]
        search_conditions = []
        
        for term in search_terms:
            term_conditions = [
                Song.title.ilike(term),
                Band.name.ilike(term),
                Blog.name.ilike(term),
                Tag.name.ilike(term),
            ]
            search_conditions.append(sa.or_(*term_conditions))
        
        stmt = stmt.join(Band, Song.band_id == Band.id, isouter=True)
        stmt = stmt.join(Blog, Song.blog_id == Blog.id, isouter=True)
        stmt = stmt.join(Song.tags, isouter=True)
        stmt = stmt.where(sa.and_(*search_conditions))
        
        # Apply filters
        if band_id is not None:
            stmt = stmt.where(Song.band_id == band_id)
        
        if blog_id is not None:
            stmt = stmt.where(Song.blog_id == blog_id)
        
        if release_year is not None:
            stmt = stmt.where(func.extract('year', Song.release_date) == release_year)
        
        if min_duration is not None:
            stmt = stmt.where(Song.duration >= min_duration)
        
        if max_duration is not None:
            stmt = stmt.where(Song.duration <= max_duration)
        
        if tag_ids:
            for tag_id in tag_ids:
                stmt = stmt.where(Song.tags.any(Tag.id == tag_id))
        
        # Apply sorting
        if sort_by == "popularity":
            # Count favorites for each song
            subq = (
                select(
                    UserSong.song_id, 
                    func.count(UserSong.user_id).label("favorite_count")
                )
                .where(UserSong.is_favorite == True)
                .group_by(UserSong.song_id)
                .subquery()
            )
            stmt = stmt.outerjoin(subq, Song.id == subq.c.song_id)
            stmt = stmt.order_by(sa.desc(sa.func.coalesce(subq.c.favorite_count, 0)))
        elif sort_by == "newest":
            stmt = stmt.order_by(sa.desc(Song.release_date))
        elif sort_by == "oldest":
            stmt = stmt.order_by(Song.release_date)
        else:
            # Default sorting by relevance (newest first as secondary criteria)
            stmt = stmt.order_by(sa.desc(Song.release_date))
        
        # Apply pagination
        stmt = stmt.offset(skip).limit(limit)
        
        result = await db.execute(stmt)
        return list(result.scalars().all())  # Convert to list

    async def get_popular_songs(
        self,
        db: AsyncSession,
        *,
        time_period: str = "all_time",
        skip: int = 0,
        limit: int = 10,
    ) -> List[Song]:
        """
        Get the most popular songs based on favorites count.
        Time period can be 'week', 'month', 'year', or 'all_time'.
        """
        # Calculate the date threshold based on time period
        now = datetime.utcnow()
        if time_period == "week":
            date_threshold = now - timedelta(days=7)
        elif time_period == "month":
            date_threshold = now - timedelta(days=30)
        elif time_period == "year":
            date_threshold = now - timedelta(days=365)
        else:  # all_time
            date_threshold = None
        
        # Query to count favorites for each song
        subq = (
            select(
                UserSong.song_id, 
                func.count(UserSong.user_id).label("favorite_count")
            )
            .where(UserSong.is_favorite == True)
        )
        
        # Apply time filter if needed
        if date_threshold:
            subq = subq.where(UserSong.created_at >= date_threshold)
        
        subq = subq.group_by(UserSong.song_id).subquery()
        
        # Main query to fetch songs with their favorite counts
        stmt = select(self.model)
        stmt = stmt.outerjoin(subq, Song.id == subq.c.song_id)
        stmt = stmt.order_by(sa.desc(sa.func.coalesce(subq.c.favorite_count, 0)))
        
        # Apply pagination
        stmt = stmt.offset(skip).limit(limit)
        
        result = await db.execute(stmt)
        return list(result.scalars().all())  # Convert to list

    async def get_song_with_details(
        self,
        db: AsyncSession,
        *,
        id: int,
        user_id: Optional[int] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Get a song by ID with additional details like band info, user-specific data, etc.
        """
        stmt = select(self.model).where(self.model.id == id)
        result = await db.execute(stmt)
        song = result.scalars().first()
        
        if not song:
            return None
        
        # Convert to dict for adding additional fields
        song_data = {
            "id": song.id,
            "title": song.title,
            "duration": song.duration,
            "file_path": song.file_path,
            "band_id": song.band_id,
            "blog_id": song.blog_id,
            "cover_image_url": song.cover_image_url,
            "release_date": song.release_date,
            "created_at": song.created_at,
            "updated_at": song.updated_at,
            "band": None,  # Initialize band field
            "blog": None,  # Initialize blog field
            "tags": [],    # Initialize tags field
            "user_data": None # Initialize user_data field
        }
        
        # Add band info if available
        if song.band_id:
            band_stmt = select(Band).where(Band.id == song.band_id)
            band_result = await db.execute(band_stmt)
            band = band_result.scalars().first()
            if band:
                song_data["band"] = {
                    "id": band.id,
                    "name": band.name,
                }
        
        # Add blog info if available
        if song.blog_id:
            blog_stmt = select(Blog).where(Blog.id == song.blog_id)
            blog_result = await db.execute(blog_stmt)
            blog = blog_result.scalars().first()
            if blog:
                song_data["blog"] = {
                    "id": blog.id,
                    "name": blog.name,
                }
        
        # Add tags
        tag_stmt = select(Tag).join(Song.tags).where(Song.id == id)
        tag_result = await db.execute(tag_stmt)
        tags = tag_result.scalars().all()
        song_data["tags"] = [
            {"id": tag.id, "name": tag.name} for tag in tags
        ]

        # Add user-specific data if user_id is provided
        if user_id is not None:
            user_song_stmt = select(UserSong).where(
                UserSong.user_id == user_id, UserSong.song_id == id
            )
            user_song_result = await db.execute(user_song_stmt)
            user_song = user_song_result.scalars().first()
            if user_song:
                song_data["user_data"] = {
                    "is_favorite": user_song.is_favorite,
                    "last_played_at": user_song.last_played_at,
                    "play_count": user_song.play_count
                }
            else:
                song_data["user_data"] = {
                    "is_favorite": False,
                    "last_played_at": None,
                    "play_count": 0
                }

        return song_data

    async def get_feed_for_user(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 10,
    ) -> List[Song]:
        """
        Get a personalized feed of songs for the user.
        Prioritizes songs from followed bands and blogs, and then general popular songs.
        """
        # Get IDs of bands and blogs followed by the user
        followed_band_ids_stmt = select(UserBand.band_id).where(UserBand.user_id == user_id)
        followed_band_ids_result = await db.execute(followed_band_ids_stmt)
        followed_band_ids = [row[0] for row in followed_band_ids_result.all()]
        
        followed_blog_ids_stmt = select(UserBlog.blog_id).where(UserBlog.user_id == user_id)
        followed_blog_ids_result = await db.execute(followed_blog_ids_stmt)
        followed_blog_ids = [row[0] for row in followed_blog_ids_result.all()]
        
        # Query for songs from followed bands and blogs
        feed_stmt = select(self.model)
        feed_stmt = feed_stmt.where(
            sa.or_(
                Song.band_id.in_(followed_band_ids),
                Song.blog_id.in_(followed_blog_ids)
            )
        )
        
        # TODO: Add more sophisticated ranking (e.g., recent releases, recommendations)
        feed_stmt = feed_stmt.order_by(sa.desc(Song.release_date))
        
        # Apply pagination
        feed_stmt = feed_stmt.offset(skip).limit(limit)
        
        result = await db.execute(feed_stmt)
        return list(result.scalars().all()) # Convert to list

    async def get_user_favorites(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 10,
    ) -> List[Song]:
        """
        Get user's favorite songs.
        """
        stmt = (
            select(self.model)
            .join(UserSong, UserSong.song_id == Song.id)
            .where(UserSong.user_id == user_id)
            .where(UserSong.is_favorite == True)
            .order_by(sa.desc(UserSong.created_at))
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_user_recently_played(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 10,
    ) -> List[Song]:
        """
        Get user's recently played songs.
        """
        stmt = (
            select(self.model)
            .join(UserSong, UserSong.song_id == Song.id)
            .where(UserSong.user_id == user_id)
            .where(UserSong.last_played_at.isnot(None))
            .order_by(sa.desc(UserSong.last_played_at))
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_similar_songs(
        self,
        db: AsyncSession,
        *,
        song_id: int,
        limit: int = 10,
    ) -> List[Song]:
        """
        Get similar songs based on shared tags, same band, or same blog.
        """
        # Get the source song with its tags
        source_stmt = select(self.model).where(self.model.id == song_id)
        source_result = await db.execute(source_stmt)
        source_song = source_result.scalars().first()

        if not source_song:
            return []

        # Build query for similar songs
        stmt = (
            select(self.model)
            .distinct()
            .where(Song.id != song_id)
            .where(
                sa.or_(
                    Song.band_id == source_song.band_id,
                    Song.blog_id == source_song.blog_id,
                    Song.tags.any(Tag.id.in_([tag.id for tag in source_song.tags]))
                )
            )
            .order_by(sa.func.random())
            .limit(limit)
        )

        result = await db.execute(stmt)
        return result.scalars().all()


song = CRUDSong(Song) 