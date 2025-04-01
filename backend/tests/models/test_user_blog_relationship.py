import pytest
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from datetime import datetime

from app.models import User, Blog, UserBlog
from app.tests.utils.user import create_random_user
from app.tests.utils.blog import create_random_blog

def test_create_user_blog_follow(db_session: Session):
    """Test creating a follow relationship between user and blog."""
    user = create_random_user(db_session)
    blog = create_random_blog(db_session)
    
    # Create follow relationship
    user_blog = UserBlog(
        user_id=user.id,
        blog_id=blog.id,
        is_following=True
    )
    db_session.add(user_blog)
    db_session.commit()
    
    # Query the relationship
    result = db_session.execute(
        select(UserBlog).where(
            UserBlog.user_id == user.id, 
            UserBlog.blog_id == blog.id
        )
    )
    user_blog_db = result.scalar_one()
    
    assert user_blog_db is not None
    assert user_blog_db.is_following is True
    assert user_blog_db.followed_at is not None

def test_user_followed_blogs_relationship(db_session: Session):
    """Test user.followed_blogs relationship."""
    user = create_random_user(db_session)
    blogs = [create_random_blog(db_session, name=f"Followed Blog {i}") for i in range(3)]
    
    # Create follow relationships
    for blog in blogs:
        user_blog = UserBlog(user_id=user.id, blog_id=blog.id, is_following=True)
        db_session.add(user_blog)
    db_session.commit()
    
    # Refresh user to load relationships
    db_session.refresh(user)
    
    assert len(user.followed_blogs) == 3
    followed_ids = {blog.id for blog in user.followed_blogs}
    assert all(blog.id in followed_ids for blog in blogs)

def test_blog_followers_relationship(db_session: Session):
    """Test blog.followers relationship."""
    blog = create_random_blog(db_session)
    users = [create_random_user(db_session, email=f"follower{i}@b.com") for i in range(3)]
    
    # Create follow relationships
    for user in users:
        user_blog = UserBlog(user_id=user.id, blog_id=blog.id, is_following=True)
        db_session.add(user_blog)
    db_session.commit()
    
    # Refresh blog to load relationships
    db_session.refresh(blog)
    
    assert len(blog.followers) == 3
    follower_ids = {user.id for user in blog.followers}
    assert all(user.id in follower_ids for user in users)

def test_unfollow_blog(db_session: Session):
    """Test unfollowing a blog (by setting is_following=False)."""
    user = create_random_user(db_session)
    blog = create_random_blog(db_session)
    
    # Create follow relationship
    user_blog = UserBlog(user_id=user.id, blog_id=blog.id, is_following=True)
    db_session.add(user_blog)
    db_session.commit()
    db_session.refresh(user_blog)
    
    # Unfollow (update relationship)
    user_blog.is_following = False
    db_session.commit()
    db_session.refresh(user_blog)

    # Verify is_following is False
    assert user_blog.is_following is False

    # Verify blog is NOT in user.followed_blogs
    db_session.refresh(user)
    followed_ids = {b.id for b in user.followed_blogs}
    assert blog.id not in followed_ids 