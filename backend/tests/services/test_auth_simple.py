import pytest
import time
from datetime import datetime, timedelta
from jose import jwt, JWTError
import bcrypt
import re
from sqlalchemy import create_engine, Column, String, Boolean, Integer, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import expression
from typing import Dict, Any, Optional, Union

# Create a self-contained test environment
Base = declarative_base()

# Mock settings
class Settings:
    JWT_SECRET = "test_jwt_secret"
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION = 30  # 30 minutes

settings = Settings()

# User model (simplified version for tests)
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

# Auth service functions
def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Data to encode in token
        expires_delta: Optional expiration time
        
    Returns:
        str: JWT token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_SECRET, 
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

def verify_token(token: str, db: Session) -> Optional[User]:
    """
    Verify a JWT token and return the associated user.
    
    Args:
        token: JWT token to verify
        db: Database session
        
    Returns:
        Optional[User]: User if token is valid, None otherwise
    """
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            return None
        
        user = db.query(User).filter(User.email == email).first()
        return user
    except JWTError:
        raise

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


class TestAuthService:
    """Test suite for authentication service."""

    def test_create_access_token(self):
        """Test creating a JWT token."""
        user_data = {"sub": "test@example.com", "username": "testuser"}
        token = create_access_token(data=user_data)
        
        assert token is not None
        assert isinstance(token, str)
        
        # Verify token is valid JWT
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        assert payload["sub"] == user_data["sub"]
        assert payload["username"] == user_data["username"]
        assert "exp" in payload
    
    def test_token_expiration(self):
        """Test that token expiration works correctly."""
        user_data = {"sub": "test@example.com"}
        
        # Create token with very short expiry
        token = create_access_token(
            data=user_data, 
            expires_delta=timedelta(seconds=1)
        )
        
        # Wait for token to expire
        time.sleep(2)
        
        # Verify token is expired
        with pytest.raises(JWTError):
            jwt.decode(
                token, 
                settings.JWT_SECRET, 
                algorithms=[settings.JWT_ALGORITHM]
            )
    
    def test_verify_token_valid(self, db_session):
        """Test token verification with valid token."""
        # Create a test user
        user = User(
            email="token@example.com",
            username="tokenuser",
            password="password123"
        )
        db_session.add(user)
        db_session.commit()
        
        # Create a token for the user
        token = create_access_token(
            data={"sub": user.email, "username": user.username}
        )
        
        # Verify the token
        verified_user = verify_token(token, db_session)
        
        assert verified_user is not None
        assert verified_user.id == user.id
        assert verified_user.email == user.email
    
    def test_verify_token_invalid(self, db_session):
        """Test token verification with invalid token."""
        # Create an invalid token
        invalid_token = "invalid.token.string"
        
        # Verify the token
        with pytest.raises(JWTError):
            verify_token(invalid_token, db_session)
    
    def test_verify_token_user_not_found(self, db_session):
        """Test token verification with non-existent user."""
        # Create a token for a non-existent user
        token = create_access_token(
            data={"sub": "nonexistent@example.com", "username": "nonexistent"}
        )
        
        # Verify the token
        verified_user = verify_token(token, db_session)
        
        assert verified_user is None 