import pytest
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from datetime import datetime

from app.models import User, UserFollow
from app.tests.utils.user import create_random_user

def test_create_user_follow(db_session: Session):
    """Test creating a follow relationship between two users."""
    follower = create_random_user(db_session, email="follower@test.com")
    followed = create_random_user(db_session, email="followed@test.com")
    
    # Create follow relationship
    user_follow = UserFollow(
        follower_id=follower.id,
        followed_id=followed.id,
        is_following=True
    )
    db_session.add(user_follow)
    db_session.commit()
    
    # Query the relationship
    result = db_session.execute(
        select(UserFollow).where(
            UserFollow.follower_id == follower.id, 
            UserFollow.followed_id == followed.id
        )
    )
    user_follow_db = result.scalar_one()
    
    assert user_follow_db is not None
    assert user_follow_db.is_following is True
    assert user_follow_db.followed_at is not None

def test_user_followed_users_relationship(db_session: Session):
    """Test user.followed_users relationship."""
    follower = create_random_user(db_session, email="mainfollower@test.com")
    followed_users = [create_random_user(db_session, email=f"followed{i}@test.com") for i in range(3)]
    
    # Create follow relationships
    for followed in followed_users:
        user_follow = UserFollow(follower_id=follower.id, followed_id=followed.id, is_following=True)
        db_session.add(user_follow)
    db_session.commit()
    
    # Refresh user to load relationships
    db_session.refresh(follower)
    
    assert len(follower.followed_users) == 3
    followed_ids = {user.id for user in follower.followed_users}
    assert all(user.id in followed_ids for user in followed_users)

def test_user_followers_relationship(db_session: Session):
    """Test user.followers relationship (using backref)."""
    followed = create_random_user(db_session, email="popular@test.com")
    followers = [create_random_user(db_session, email=f"fan{i}@test.com") for i in range(3)]
    
    # Create follow relationships
    for follower in followers:
        user_follow = UserFollow(follower_id=follower.id, followed_id=followed.id, is_following=True)
        db_session.add(user_follow)
    db_session.commit()
    
    # Refresh user to load relationships (via backref)
    db_session.refresh(followed)
    
    assert len(followed.followers) == 3
    follower_ids = {user.id for user in followed.followers}
    assert all(user.id in follower_ids for user in followers)

def test_unfollow_user(db_session: Session):
    """Test unfollowing a user (by setting is_following=False)."""
    follower = create_random_user(db_session, email="unfollower@test.com")
    followed = create_random_user(db_session, email="target@test.com")
    
    # Create follow relationship
    user_follow = UserFollow(follower_id=follower.id, followed_id=followed.id, is_following=True)
    db_session.add(user_follow)
    db_session.commit()
    db_session.refresh(user_follow)
    
    # Unfollow (update relationship)
    user_follow.is_following = False
    db_session.commit()
    db_session.refresh(user_follow)

    # Verify is_following is False
    assert user_follow.is_following is False

    # Verify followed user is NOT in follower.followed_users
    db_session.refresh(follower)
    followed_ids = {u.id for u in follower.followed_users}
    assert followed.id not in followed_ids

    # Verify follower is NOT in followed.followers
    db_session.refresh(followed)
    follower_ids = {u.id for u in followed.followers}
    assert follower.id not in follower_ids

def test_follow_self(db_session: Session):
    """Test if a user can follow themselves (depends on constraints/logic)."""
    user = create_random_user(db_session, email="narcissist@test.com")
    
    # Try to create self-follow relationship
    user_follow = UserFollow(follower_id=user.id, followed_id=user.id, is_following=True)
    db_session.add(user_follow)
    
    # This might succeed at DB level unless there's a CHECK constraint
    # Business logic in service/API should prevent this
    try:
        db_session.commit()
        # If it succeeds, check the state
        db_session.refresh(user)
        assert user.id not in {u.id for u in user.followed_users} # Assuming logic prevents self-follow display
    except IntegrityError:
        # If a DB constraint (e.g., CHECK follower_id != followed_id) exists
        db_session.rollback()
        pass 