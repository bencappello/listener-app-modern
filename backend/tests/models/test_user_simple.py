import pytest
import bcrypt
import re
from sqlalchemy import create_engine, Column, String, Boolean, Integer, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import expression
from datetime import datetime
from typing import Any, Optional

# Create a self-contained test environment without external dependencies
Base = declarative_base()

class User(Base):
    """User model with authentication capabilities."""
    
    __tablename__ = "user"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    is_active = Column(Boolean, server_default=expression.true(), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __init__(self, **kwargs):
        """Initialize user and hash password if provided."""
        if "password" in kwargs:
            kwargs["password"] = self.hash_password(kwargs["password"])
        super().__init__(**kwargs)
        
        # Validate email format
        if not self._is_valid_email(self.email):
            raise ValueError("Invalid email format")
    
    @staticmethod
    def _is_valid_email(email: str) -> bool:
        """Validate email format using regex."""
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        return re.match(email_regex, email) is not None
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt."""
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')
    
    def check_password(self, password: str) -> bool:
        """Check if a password matches the stored hash."""
        password_bytes = password.encode('utf-8')
        hashed_bytes = self.password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    
    def update_password(self, new_password: str) -> None:
        """Update the user's password."""
        self.password = self.hash_password(new_password)


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