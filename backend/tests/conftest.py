import os
import pytest
from typing import Generator, Dict, Any
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.db.base import Base
from app.db.session import get_db
from main import app

# Use test database
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/test_db"
)

# Create test database engine
engine = create_engine(TEST_DATABASE_URL, poolclass=NullPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Fixture to create and drop test database tables
@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    # Create the tables
    Base.metadata.create_all(bind=engine)
    
    # Create a new session for testing
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        
    # Drop the tables after test
    Base.metadata.drop_all(bind=engine)


# Fixture to override the dependency
@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    # Override the get_db dependency
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    # Apply the override
    app.dependency_overrides[get_db] = override_get_db
    
    # Create test client
    with TestClient(app) as test_client:
        yield test_client
    
    # Clear the override
    app.dependency_overrides.clear()


# Fixture for test user data
@pytest.fixture(scope="function")
def test_user() -> Dict[str, Any]:
    return {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpassword123"
    }


# Fixture for test song data
@pytest.fixture(scope="function")
def test_song() -> Dict[str, Any]:
    return {
        "name": "Test Song",
        "band_name": "Test Band",
        "audio_url": "https://example.com/song.mp3",
        "song_type": "regular"
    } 