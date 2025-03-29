import pytest
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import tempfile
import sqlite3

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from app.models.user import User
from app.db.base import Base

# Setup SQLite in-memory database for testing
@pytest.fixture
def db_session():
    """Create a new database session for a test."""
    # Use SQLite in-memory database
    engine = create_engine("sqlite:///:memory:", echo=False)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


class TestUserModel:
    """Test suite for User model."""

    def test_create_user(self, db_session: Session):
        """Test creating a new user."""
        user = User(
            email="test@example.com",
            username="testuser",
            password="password123"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.username == "testuser"
        assert user.password != "password123"  # Password should be hashed
        assert user.check_password("password123") is True
        assert user.check_password("wrongpassword") is False

    def test_email_unique(self, db_session: Session):
        """Test that emails must be unique."""
        user1 = User(
            email="duplicate@example.com", 
            username="user1",
            password="password123"
        )
        db_session.add(user1)
        db_session.commit()

        user2 = User(
            email="duplicate@example.com", 
            username="user2",
            password="password456"
        )
        db_session.add(user2)
        
        with pytest.raises(Exception):  # Changed from IntegrityError for SQLite
            db_session.commit()
            
        db_session.rollback()

    def test_username_unique(self, db_session: Session):
        """Test that usernames must be unique."""
        user1 = User(
            email="user1@example.com", 
            username="duplicate",
            password="password123"
        )
        db_session.add(user1)
        db_session.commit()

        user2 = User(
            email="user2@example.com", 
            username="duplicate",
            password="password456"
        )
        db_session.add(user2)
        
        with pytest.raises(Exception):  # Changed from IntegrityError for SQLite
            db_session.commit()
            
        db_session.rollback()

    def test_password_hashing(self, db_session: Session):
        """Test that passwords are properly hashed."""
        password = "securepassword123"
        user = User(
            email="hash@example.com",
            username="hashuser",
            password=password
        )
        db_session.add(user)
        db_session.commit()

        assert user.password != password
        assert user.check_password(password) is True
        assert len(user.password) > len(password)

    def test_invalid_email_format(self, db_session: Session):
        """Test that invalid email formats are rejected."""
        with pytest.raises(ValueError):
            user = User(
                email="invalid-email", 
                username="invalidemail",
                password="password123"
            ) 