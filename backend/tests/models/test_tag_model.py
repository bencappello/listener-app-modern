import pytest
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models import Tag, Song, Band, Blog
from app.utils import random_string

def test_create_tag(db_session: Session):
    """Test creating a new tag."""
    tag_name = f"Test Tag {random_string()}"
    tag = Tag(name=tag_name, description="A test tag description")
    db_session.add(tag)
    db_session.commit()
    
    assert tag.id is not None
    assert tag.name == tag_name
    assert tag.description == "A test tag description"
    assert tag.created_at is not None
    assert tag.updated_at is not None

def test_create_tag_no_description(db_session: Session):
    """Test creating a tag without a description."""
    tag_name = f"Test Tag {random_string()}"
    tag = Tag(name=tag_name)
    db_session.add(tag)
    db_session.commit()
    
    assert tag.id is not None
    assert tag.name == tag_name
    assert tag.description is None

def test_create_duplicate_tag(db_session: Session):
    """Test that creating a tag with a duplicate name raises an error."""
    tag_name = f"Test Tag {random_string()}"
    
    # Create first tag
    tag1 = Tag(name=tag_name)
    db_session.add(tag1)
    db_session.commit()
    
    # Try to create second tag with same name
    tag2 = Tag(name=tag_name)
    db_session.add(tag2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()

def test_tag_song_relationship(db_session: Session):
    """Test the relationship between tags and songs."""
    # Create a tag
    tag = Tag(name=f"Test Tag {random_string()}")
    db_session.add(tag)
    
    # Create a song
    song = Song(
        title=f"Test Song {random_string()}",
        duration=180,
        file_path="/path/to/song.mp3"
    )
    db_session.add(song)
    
    # Associate tag with song
    song.tags.append(tag)
    db_session.commit()
    
    # Verify relationship
    assert tag in song.tags
    assert song in tag.songs

def test_tag_band_relationship(db_session: Session):
    """Test the relationship between tags and bands."""
    # Create a tag
    tag = Tag(name=f"Test Tag {random_string()}")
    db_session.add(tag)
    
    # Create a band
    band = Band(name=f"Test Band {random_string()}")
    db_session.add(band)
    
    # Associate tag with band
    band.tags.append(tag)
    db_session.commit()
    
    # Verify relationship
    assert tag in band.tags
    assert band in tag.bands

def test_tag_blog_relationship(db_session: Session):
    """Test the relationship between tags and blogs."""
    # Create a tag
    tag = Tag(name=f"Test Tag {random_string()}")
    db_session.add(tag)
    
    # Create a blog
    blog = Blog(
        name=f"Test Blog {random_string()}",
        url="https://example.com/blog"
    )
    db_session.add(blog)
    
    # Associate tag with blog
    blog.tags.append(tag)
    db_session.commit()
    
    # Verify relationship
    assert tag in blog.tags
    assert blog in tag.blogs

def test_tag_multiple_relationships(db_session: Session):
    """Test that a tag can be associated with multiple entities."""
    # Create a tag
    tag = Tag(name=f"Test Tag {random_string()}")
    db_session.add(tag)
    
    # Create entities
    song = Song(
        title=f"Test Song {random_string()}",
        duration=180,
        file_path="/path/to/song.mp3"
    )
    band = Band(name=f"Test Band {random_string()}")
    blog = Blog(
        name=f"Test Blog {random_string()}",
        url="https://example.com/blog"
    )
    
    db_session.add_all([song, band, blog])
    
    # Associate tag with all entities
    song.tags.append(tag)
    band.tags.append(tag)
    blog.tags.append(tag)
    db_session.commit()
    
    # Verify relationships
    assert tag in song.tags
    assert tag in band.tags
    assert tag in blog.tags
    assert song in tag.songs
    assert band in tag.bands
    assert blog in tag.blogs 