import os
import sys
import pytest
import json
import asyncio
import greenlet
from typing import Generator, Dict, Any, List, AsyncGenerator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_scoped_session
from sqlalchemy.pool import NullPool
from httpx import AsyncClient, ASGITransport
import pytest_asyncio
from sqlalchemy import event
from fastapi import HTTPException, status, FastAPI

# Add backend directory to Python path *first*
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Configure SQLAlchemy greenlet_spawn before importing or creating any engines
# This is needed for SQLAlchemy to correctly handle async operations
from sqlalchemy.util import greenlet_spawn as sa_greenlet_spawn

# Now import models and other app components
from app.models.user import User
from app.models.band import Band
from app.models.blog import Blog
from app.models.tag import Tag
from app.models.song import Song
from app.models.user_song import UserSong
from app.models.user_blog import UserBlog
from app.models.user_follow import UserFollow
from app.models.user_band import UserBand
from app.models.song_tag import SongTag
from app.models.band_tag import BandTag
from app.models.blog_tag import BlogTag
from app.models.comment import Comment

from app.db.base import Base
from main import app
from app.api.dependencies import get_async_db, get_current_active_user
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash
from app.db.session import get_db

def run_in_greenlet(fn, *args, **kwargs):
    """Run a function in a greenlet"""
    current = greenlet.getcurrent()
    result = greenlet.greenlet(fn).switch(*args, **kwargs)
    return result

# Monkey patch SQLAlchemy's greenlet_spawn
sa_greenlet_spawn.greenlet_spawn = run_in_greenlet

# Use SQLite in-memory for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
ASYNC_SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

# Create test database engine (sync)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create async test database engine
async_engine = create_async_engine(
    ASYNC_SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=NullPool
)
AsyncTestingSessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=async_engine, 
    class_=AsyncSession
)

# Create a session-scoped event loop for async tests
@pytest.fixture(scope="session")
def event_loop():
    """
    Create an instance of the default event loop for each test case.
    This is needed for session-wide async fixtures.
    """
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    asyncio.set_event_loop(loop)
    yield loop
    loop.close()

# Fixture for the FastAPI application
@pytest.fixture(scope="session")
def app() -> FastAPI:
    """
    Create a fresh FastAPI application for testing.
    """
    from main import app
    return app

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


# Fixture for async DB sessions
@pytest_asyncio.fixture(scope="function")
async def async_db() -> AsyncSession:
    # Create tables if they don't exist
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create a DB session
    async with AsyncTestingSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
    
    # Drop tables after test
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


# Alias for db fixture for backward compatibility
@pytest.fixture(scope="function")
def db_session(db: Session) -> Session:
    return db


# Fixture for async DB session alias
@pytest_asyncio.fixture(scope="function")
async def async_db_session(async_db: AsyncSession) -> AsyncSession:
    return async_db


# Fixture to override the dependency
@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    # Override the get_db dependency
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    # Apply ONLY the DB override
    app.dependency_overrides[get_db] = override_get_db
    # Removed overrides for get_current_user, get_current_active_user
    
    # Create test client
    with TestClient(app) as test_client:
        yield test_client
    
    # Clear the override
    app.dependency_overrides.clear()


# Fixture for async client with async DB dependency override
@pytest_asyncio.fixture
async def async_client(app: FastAPI, async_db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client that uses the test database."""
    async def get_test_db():
        try:
            yield async_db
        finally:
            await async_db.close()

    test_user = User(
        email="test@example.com",
        username="testuser",
        password="testpassword",
        is_active=True,
        is_superuser=True
    )
    async_db.add(test_user)
    await async_db.commit()
    await async_db.refresh(test_user)

    async def get_test_user():
        return test_user

    app.dependency_overrides[get_async_db] = get_test_db
    app.dependency_overrides[get_current_active_user] = get_test_user

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


# Fixture for superuser authentication headers
@pytest_asyncio.fixture(scope="function")
async def superuser_token_headers(async_db: AsyncSession) -> Dict[str, str]:
    """
    Fixture to create a superuser and return authentication headers.
    """
    # Check if settings has EMAIL_TEST_USER etc., or define defaults
    superuser_email = getattr(settings, "FIRST_SUPERUSER_EMAIL", "admin@example.com")
    superuser_username = getattr(settings, "FIRST_SUPERUSER", "admin")
    superuser_password = getattr(settings, "FIRST_SUPERUSER_PASSWORD", "password")
    
    # Create the superuser if not exists
    result = await async_db.execute(
        User.__table__.select().where(User.email == superuser_email)
    )
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            email=superuser_email,
            username=superuser_username,
            password=superuser_password, # Password will be hashed by User model's __init__
            is_superuser=True,
            is_active=True
        )
        async_db.add(user)
        await async_db.commit()
        await async_db.refresh(user)
    
    # Generate token for the superuser
    token_data = {"sub": user.email, "username": user.username}
    access_token = create_access_token(data=token_data)
    
    headers = {"Authorization": f"Bearer {access_token}"}
    return headers


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
def test_db_user(db: Session) -> User:
    user = User(
        email="test_user@example.com",
        username="test_db_user",
        password="password123"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# Fixture to create a test user in the async database
@pytest_asyncio.fixture
async def async_test_db_user(async_db_session: AsyncSession) -> User:
    user = User(
        email="async_test_user@example.com",
        username="async_test_db_user",
        password="password123"
    )
    async_db_session.add(user)
    await async_db_session.commit()
    await async_db_session.refresh(user)
    return user


# Fixture to create a test song in the database
@pytest.fixture(scope="function")
def test_db_song(db: Session, test_db_user: User) -> Dict[str, Any]:
    # This will be implemented in Step 8 when we create the Song model
    # For now, return mock data
    return {
        "id": 1,
        "name": "Test Song",
        "band_name": "Test Band",
        "audio_url": "https://example.com/song.mp3",
        "song_type": "regular",
        "user_id": test_db_user.id
    }


# Fixture to create a test blog in the database
@pytest.fixture(scope="function")
def test_db_blog(db: Session, test_db_user: User) -> Dict[str, Any]:
    # This will be implemented in Step 8 when we create the Blog model
    # For now, return mock data
    return {
        "id": 1,
        "name": "Test Blog",
        "url": "https://example.com/blog",
        "user_id": test_db_user.id
    }


# Fixture to create multiple test users
@pytest.fixture(scope="function")
def test_db_users(db: Session, count: int = 5) -> List[User]:
    users = []
    for i in range(count):
        user = User(
            email=f"user{i}@example.com",
            username=f"testuser{i}",
            password="password123"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        users.append(user)
    return users


# Fixture to create multiple test songs
@pytest.fixture(scope="function")
def test_db_songs(db: Session, test_db_user: User, count: int = 5) -> List[Dict[str, Any]]:
    # This will be implemented in Step 8 when we create the Song model
    # For now, return mock data
    return [
        {
            "id": i,
            "name": f"Test Song {i}",
            "band_name": "Test Band",
            "audio_url": f"https://example.com/song{i}.mp3",
            "song_type": "regular",
            "user_id": test_db_user.id
        }
        for i in range(1, count + 1)
    ]


# Fixture for authentication headers
@pytest.fixture(scope="function")
def auth_headers(client: TestClient, test_db_user: User) -> Dict[str, str]:
    token_data = {"sub": test_db_user.email, "username": test_db_user.username}
    access_token = create_access_token(data=token_data)
    return {"Authorization": f"Bearer {access_token}"}


# Fixture for async authentication headers
@pytest_asyncio.fixture(scope="function")
async def async_auth_headers(async_client: AsyncClient, async_test_db_user: User) -> Dict[str, str]:
    token_data = {"sub": async_test_db_user.email, "username": async_test_db_user.username}
    access_token = create_access_token(data=token_data)
    return {"Authorization": f"Bearer {access_token}"}


@pytest_asyncio.fixture(scope="function")
async def authenticated_user(
    request: pytest.FixtureRequest,
    app: FastAPI,
    async_db: AsyncSession,
    email: str = "test@example.com",
    username: str = "testuser",
    password: str = "testpass",
    is_superuser: bool = False,
) -> Dict[str, Any]:
    """
    Fixture to create a user and return authentication headers.
    """
    # Create the user if not exists
    result = await async_db.execute(
        User.__table__.select().where(User.email == email)
    )
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            email=email,
            username=username,
            password=password,  # Password will be hashed by User model's __init__
            is_superuser=is_superuser,
            is_active=True
        )
        async_db.add(user)
        await async_db.commit()
        await async_db.refresh(user)

    token_data = {"sub": email, "username": username}
    access_token = create_access_token(data=token_data)
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Override the current user dependency
    async def override_get_current_user():
        return user

    # Override the superuser dependency to return the user if it has is_superuser=True
    async def override_get_current_active_superuser():
        if hasattr(user, "is_superuser") and user.is_superuser:
            return user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Apply the overrides
    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_current_active_user] = override_get_current_user
    app.dependency_overrides[get_current_active_superuser] = override_get_current_active_superuser
    
    # Add finalizer to clear overrides
    def fin():
        app.dependency_overrides.clear()
    request.addfinalizer(fin)
    
    return {"user": user, "token": access_token, "headers": headers}


# Fixture for test data directory
@pytest.fixture(scope="function")
def test_data_dir() -> str:
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "data") 