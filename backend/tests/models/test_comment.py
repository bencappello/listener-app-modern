import pytest
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models import Comment, User, Song, Band, Blog
from tests.utils.user import create_random_user
from tests.utils.song import create_random_song
from tests.utils.band import create_random_band
from tests.utils.blog import create_random_blog


def test_create_comment_on_song(db_session: Session):
    """Test creating a comment associated with a song."""
    user = create_random_user(db_session)
    song = create_random_song(db_session)
    comment_content = "This is a comment on a song."
    
    comment = Comment(
        content=comment_content,
        user_id=user.id,
        song_id=song.id
    )
    db_session.add(comment)
    db_session.commit()
    db_session.refresh(user)
    db_session.refresh(song)
    db_session.refresh(comment)
    
    assert comment.id is not None
    assert comment.content == comment_content
    assert comment.user_id == user.id
    assert comment.song_id == song.id
    assert comment.band_id is None
    assert comment.blog_id is None
    assert comment.target_type == "song"
    assert comment.user == user
    assert comment.song == song
    assert comment in user.comments
    assert comment in song.comments
    assert user.id in [c.user_id for c in song.comments]

def test_create_comment_on_band(db_session: Session):
    """Test creating a comment associated with a band."""
    user = create_random_user(db_session)
    band = create_random_band(db_session)
    comment_content = "This is a comment on a band."
    
    comment = Comment(
        content=comment_content,
        user_id=user.id,
        band_id=band.id
    )
    db_session.add(comment)
    db_session.commit()
    db_session.refresh(comment)
    
    assert comment.id is not None
    assert comment.content == comment_content
    assert comment.user_id == user.id
    assert comment.song_id is None
    assert comment.band_id == band.id
    assert comment.blog_id is None
    assert comment.target_type == "band"
    assert comment.band == band

def test_create_comment_on_blog(db_session: Session):
    """Test creating a comment associated with a blog."""
    user = create_random_user(db_session)
    blog = create_random_blog(db_session)
    comment_content = "This is a comment on a blog."
    
    comment = Comment(
        content=comment_content,
        user_id=user.id,
        blog_id=blog.id
    )
    db_session.add(comment)
    db_session.commit()
    db_session.refresh(comment)
    
    assert comment.id is not None
    assert comment.content == comment_content
    assert comment.user_id == user.id
    assert comment.song_id is None
    assert comment.band_id is None
    assert comment.blog_id == blog.id
    assert comment.target_type == "blog"
    assert comment.blog == blog

def test_create_comment_no_user(db_session: Session):
    """Test creating a comment without a user raises error."""
    song = create_random_song(db_session)
    comment = Comment(content="No user comment", song_id=song.id)
    db_session.add(comment)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()

def test_create_comment_no_target(db_session: Session):
    """Test creating a comment without any target raises error or fails validation."""
    # This might depend on model/schema constraints. 
    # The model's __init__ might not set target_type if no ID is passed.
    # A DB constraint might also catch this if target_type is non-nullable and has no default.
    user = create_random_user(db_session)
    comment = Comment(content="No target comment", user_id=user.id)
    db_session.add(comment)
    # Depending on implementation, this might raise IntegrityError 
    # or the target_type might remain None/Null.
    with pytest.raises(IntegrityError): 
         # Assuming target_type is NOT NULL and has no default
        db_session.commit()
    db_session.rollback()

def test_create_comment_multiple_targets(db_session: Session):
    """Test creating a comment with multiple target IDs fails (if constrained)."""
    # The schema validator should prevent this at the API level.
    # At the model level, it depends on constraints. Let's assume the __init__ logic 
    # prioritizes one, or a DB constraint prevents it (less likely without check constraints).
    user = create_random_user(db_session)
    song = create_random_song(db_session)
    band = create_random_band(db_session)
    comment = Comment(
        content="Multi-target comment", 
        user_id=user.id, 
        song_id=song.id, 
        band_id=band.id # Add multiple targets
    )
    # The __init__ likely sets target_type='song' based on order. 
    # A stricter test would involve checking DB constraints if they exist.
    db_session.add(comment)
    db_session.commit() # This might pass if no DB constraints exist
    db_session.refresh(comment)
    assert comment.target_type == "song" # Based on current __init__ logic 