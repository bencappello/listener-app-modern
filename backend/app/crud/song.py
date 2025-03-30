from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta
import sqlalchemy as sa
from sqlalchemy.orm import Session
from sqlalchemy.sql import text, func

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
    def search(
        self,
        db: Session,
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
        q = db.query(self.model).distinct()
        
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
        
        q = q.join(Band, Song.band_id == Band.id, isouter=True)
        q = q.join(Blog, Song.blog_id == Blog.id, isouter=True)
        q = q.join(Song.tags, isouter=True)
        q = q.filter(sa.and_(*search_conditions))
        
        # Apply filters
        if band_id is not None:
            q = q.filter(Song.band_id == band_id)
        
        if blog_id is not None:
            q = q.filter(Song.blog_id == blog_id)
        
        if release_year is not None:
            q = q.filter(func.extract('year', Song.release_date) == release_year)
        
        if min_duration is not None:
            q = q.filter(Song.duration >= min_duration)
        
        if max_duration is not None:
            q = q.filter(Song.duration <= max_duration)
        
        if tag_ids:
            for tag_id in tag_ids:
                q = q.filter(Song.tags.any(Tag.id == tag_id))
        
        # Apply sorting
        if sort_by == "popularity":
            # Count favorites for each song
            subq = (
                db.query(
                    UserSong.song_id, 
                    func.count(UserSong.user_id).label("favorite_count")
                )
                .filter(UserSong.is_favorite == True)
                .group_by(UserSong.song_id)
                .subquery()
            )
            q = q.outerjoin(subq, Song.id == subq.c.song_id)
            q = q.order_by(sa.desc(sa.func.coalesce(subq.c.favorite_count, 0)))
        elif sort_by == "newest":
            q = q.order_by(sa.desc(Song.release_date))
        elif sort_by == "oldest":
            q = q.order_by(Song.release_date)
        else:
            # Default sorting by relevance (newest first as secondary criteria)
            q = q.order_by(sa.desc(Song.release_date))
        
        # Apply pagination
        q = q.offset(skip).limit(limit)
        
        return q.all()

    def get_popular_songs(
        self,
        db: Session,
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
        subq = db.query(
            UserSong.song_id, 
            func.count(UserSong.user_id).label("favorite_count")
        ).filter(UserSong.is_favorite == True)
        
        # Apply time filter if needed
        if date_threshold:
            subq = subq.filter(UserSong.created_at >= date_threshold)
        
        subq = subq.group_by(UserSong.song_id).subquery()
        
        # Main query to fetch songs with their favorite counts
        q = db.query(self.model)
        q = q.outerjoin(subq, Song.id == subq.c.song_id)
        q = q.order_by(sa.desc(sa.func.coalesce(subq.c.favorite_count, 0)))
        
        # Apply pagination
        q = q.offset(skip).limit(limit)
        
        return q.all()

    def get_song_with_details(
        self,
        db: Session,
        *,
        id: int,
        user_id: Optional[int] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Get a song by ID with additional details like band info, user-specific data, etc.
        """
        song = db.query(self.model).filter(self.model.id == id).first()
        
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
        }
        
        # Add band info if available
        if song.band_id:
            band = db.query(Band).filter(Band.id == song.band_id).first()
            if band:
                song_data["band"] = {
                    "id": band.id,
                    "name": band.name,
                }
        
        # Add blog info if available
        if song.blog_id:
            blog = db.query(Blog).filter(Blog.id == song.blog_id).first()
            if blog:
                song_data["blog"] = {
                    "id": blog.id,
                    "name": blog.name,
                    "url": blog.url,
                }
        
        # Add tags
        song_data["tags"] = [{"id": tag.id, "name": tag.name} for tag in song.tags]
        
        # Add user-specific data if user_id is provided
        if user_id:
            user_song = db.query(UserSong).filter(
                UserSong.user_id == user_id,
                UserSong.song_id == song.id
            ).first()
            
            song_data["is_favorited"] = bool(user_song and user_song.is_favorite)
            song_data["play_count"] = getattr(user_song, "play_count", 0) if user_song else 0
        
        # Add popularity metrics
        favorite_count = db.query(func.count(UserSong.user_id)).filter(
            UserSong.song_id == song.id,
            UserSong.is_favorite == True
        ).scalar()
        
        song_data["favorite_count"] = favorite_count or 0
        
        return song_data

    def get_feed_for_user(
        self,
        db: Session,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 10,
    ) -> List[Song]:
        """
        Generate a personalized feed of songs for a user based on their followed blogs and bands.
        Falls back to popular songs if the user doesn't follow any blogs or bands.
        """
        # Get blogs and bands that the user follows
        followed_blogs = db.query(UserBlog.blog_id).filter(
            UserBlog.user_id == user_id
        ).subquery()
        
        followed_bands = db.query(UserBand.band_id).filter(
            UserBand.user_id == user_id
        ).subquery()
        
        # Query songs from followed blogs and bands
        q = db.query(self.model).distinct().filter(
            sa.or_(
                Song.blog_id.in_(followed_blogs),
                Song.band_id.in_(followed_bands)
            )
        )
        
        # Order by newest first
        q = q.order_by(sa.desc(Song.release_date))
        
        # Apply pagination
        q = q.offset(skip).limit(limit)
        
        # Get results
        songs = q.all()
        
        # If no songs found, fall back to popular songs
        if not songs:
            songs = self.get_popular_songs(db, time_period="month", skip=skip, limit=limit)
        
        return songs


song = CRUDSong(Song) 