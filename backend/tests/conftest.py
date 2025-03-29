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
from httpx import AsyncClient
import pytest_asyncio
from sqlalchemy import event

# Configure SQLAlchemy greenlet_spawn before importing or creating any engines
# This is needed for SQLAlchemy to correctly handle async operations
from sqlalchemy.util import greenlet_spawn as sa_greenlet_spawn

def run_in_greenlet(fn, *args, **kwargs):
    """Run a function in a greenlet"""
    current = greenlet.getcurrent()
    result = greenlet.greenlet(fn).switch(*args, **kwargs)
    return result

# Monkey patch SQLAlchemy's greenlet_spawn
sa_greenlet_spawn.greenlet_spawn = run_in_greenlet

# Add backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.core.config import settings
    from app.db.base import Base
    from app.db.session import get_db, get_async_db
    from app.models.user import User
    from app.services.auth import create_access_token
    from app.api import dependencies as deps
    from main import app
    from tests.factories import UserFactory, SongFactory, BlogFactory
except ImportError as e:
    print(f"Import error: {e}")
    print(f"Current sys.path: {sys.path}")
    raise

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
    
    # Creating a test user for auth
    user = User(
        email="test_client_user@example.com",
        username="test_client_user",
        password="password123",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create a mock for the current user dependency
    def override_get_current_user():
        return user
    
    # Apply the overrides
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[deps.get_current_user] = override_get_current_user
    app.dependency_overrides[deps.get_current_active_user] = override_get_current_user
    app.dependency_overrides[deps.get_current_active_superuser] = override_get_current_user
    
    # Create test client
    with TestClient(app) as test_client:
        yield test_client
    
    # Clear the override
    app.dependency_overrides.clear()


# Fixture for async client with async DB dependency override
@pytest_asyncio.fixture(scope="function")
async def async_client(async_db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    # Override the get_async_db dependency
    async def override_get_async_db():
        try:
            yield async_db
        finally:
            pass
    
    # Creating a test user for auth
    user = User(
        email="test_async_client_user@example.com",
        username="test_async_client_user",
        password="password123",
        is_active=True
    )
    async_db.add(user)
    await async_db.commit()
    await async_db.refresh(user)
    
    # Override auth dependencies to use our test user
    async def override_get_current_user_async():
        return user
        
    # Apply the overrides
    app.dependency_overrides[get_async_db] = override_get_async_db
    app.dependency_overrides[deps.get_current_user_async] = override_get_current_user_async
    app.dependency_overrides[deps.get_current_active_user_async] = override_get_current_user_async
    app.dependency_overrides[deps.get_current_active_superuser_async] = override_get_current_user_async
    
    # Create async test client with properly configured transport
    from httpx import ASGITransport
    
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
        follow_redirects=True
    ) as test_client:
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


# Fixture for authenticated user
@pytest.fixture(scope="function")
def authenticated_user(client: TestClient, db: Session) -> Dict[str, Any]:
    # Create a test user and obtain token
    email = "auth_test@example.com"
    username = "auth_test_user"
    password = "password123"
    
    user = User(
        email=email,
        username=username,
        password=password,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token_data = {"sub": email, "username": username}
    access_token = create_access_token(data=token_data)
    headers = {"Authorization": f"Bearer {access_token}"}
    
    return {"user": user, "token": access_token, "headers": headers}


# Fixture for test data directory
@pytest.fixture(scope="function")
def test_data_dir() -> str:
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "data") 