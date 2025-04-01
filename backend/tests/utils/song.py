import random
import string

from sqlalchemy.orm import Session

from app.models.song import Song
from app.schemas.songs.song import SongCreate

def random_lower_string(length: int = 32) -> str:
    return "".join(random.choices(string.ascii_lowercase, k=length))

def create_random_song(db: Session, *, title: str | None = None, band_id: int | None = None, blog_id: int | None = None) -> Song:
    """Create a random song for testing."""
    if title is None:
        title = random_lower_string(15)
    duration = random.randint(120, 600)
    file_path = f"/test/path/{random_lower_string(10)}.mp3"
    
    song_in_data = {
        "title": title,
        "duration": duration,
        "file_path": file_path,
    }
    if band_id:
        song_in_data["band_id"] = band_id
    if blog_id:
        song_in_data["blog_id"] = blog_id
        
    # Use direct model creation for tests
    song_obj = Song(**song_in_data)
    db.add(song_obj)
    db.commit()
    db.refresh(song_obj)
    return song_obj 