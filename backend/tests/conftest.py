import os
import pytest
import json
from typing import Generator, Dict, Any, List
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.db.base import Base
from app.db.session import get_db
from main import app
from tests.factories import UserFactory, SongFactory, BlogFactory

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


# Fixture to create a test user in the database
@pytest.fixture(scope="function")
def test_db_user(db: Session) -> Dict[str, Any]:
    # This will be implemented in Step 7 when we create the User model
    # For now, return a mock user
    return UserFactory.create()


# Fixture to create a test song in the database
@pytest.fixture(scope="function")
def test_db_song(db: Session, test_db_user: Dict[str, Any]) -> Dict[str, Any]:
    # This will be implemented in Step 8 when we create the Song model
    # For now, return a mock song
    return SongFactory.create(user_id=test_db_user["id"])


# Fixture to create a test blog in the database
@pytest.fixture(scope="function")
def test_db_blog(db: Session, test_db_user: Dict[str, Any]) -> Dict[str, Any]:
    # This will be implemented in Step 8 when we create the Blog model
    # For now, return a mock blog
    return BlogFactory.create(user_id=test_db_user["id"])


# Fixture to create multiple test users
@pytest.fixture(scope="function")
def test_db_users(db: Session, count: int = 5) -> List[Dict[str, Any]]:
    # This will be implemented in Step 7 when we create the User model
    # For now, return mock users
    return [UserFactory.create() for _ in range(count)]


# Fixture to create multiple test songs
@pytest.fixture(scope="function")
def test_db_songs(db: Session, test_db_user: Dict[str, Any], count: int = 5) -> List[Dict[str, Any]]:
    # This will be implemented in Step 8 when we create the Song model
    # For now, return mock songs
    return [SongFactory.create(user_id=test_db_user["id"]) for _ in range(count)]


# Fixture for authentication headers
@pytest.fixture(scope="function")
def auth_headers(client: TestClient, test_db_user: Dict[str, Any]) -> Dict[str, str]:
    # This will be implemented when we set up authentication in Step 7
    # For now, return mock headers
    return {"Authorization": f"Bearer mock_token_for_{test_db_user['id']}"}


# Fixture for test data directory
@pytest.fixture(scope="session")
def test_data_dir() -> str:
    """Return the path to the test data directory."""
    return os.path.join(os.path.dirname(__file__), "data") 