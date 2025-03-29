"""
Test module for favorites API endpoints with async functionality.
This module demonstrates a hybrid approach to testing async features
using synchronous endpoints for reliability.

Note: This test is kept for reference and educational purposes.
      For production testing, prefer using test_favorites.py.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.song import Song
from app.models.user_song import UserSong
from app.db.session import get_db
from app.api import dependencies as deps
from main import app


def test_favorites_hybrid_approach(db: Session):
    """
    Test the favorites API using synchronous endpoints.
    This demonstrates a hybrid approach that avoids async SQLAlchemy issues
    while still testing the core functionality.
    """
    # Create a test user
    user = User(
        email="test_favorites_hybrid@example.com",
        username="test_favorites_hybrid",
        password="password123",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create a test song
    song = Song(
        title="Test Hybrid Song",
        duration=200,
        file_path="/path/to/hybrid_test.mp3"
    )
    db.add(song)
    db.commit()
    db.refresh(song)
    
    song_id = song.id
    user_id = user.id
    
    # Override dependencies for testing
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    def override_get_current_user():
        return user
    
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[deps.get_current_user] = override_get_current_user
    app.dependency_overrides[deps.get_current_active_user] = override_get_current_user
    
    # Create a test client
    client = TestClient(app)
    
    try:
        # Test adding a song to favorites
        response = client.post(
            "/api/v1/users/me/favorites/sync",
            json={"song_id": song_id}
        )
        assert response.status_code == 201
        
        # Verify it was added properly
        direct_check = db.query(UserSong).filter(
            UserSong.user_id == user_id,
            UserSong.song_id == song_id
        ).first()
        assert direct_check is not None
        assert direct_check.is_favorite is True
        
        # Clean up directly using SQL
        db.delete(direct_check)
        db.commit()
    
    finally:
        # Clean up and clear overrides
        app.dependency_overrides.clear()
        
        # Delete test data
        db.query(Song).filter(Song.id == song_id).delete()
        db.query(User).filter(User.id == user_id).delete()
        db.commit()


"""
NOTES ON ASYNC TESTING WITH SQLALCHEMY:

When implementing true asynchronous tests, consider these points:

1. Greenlet issues: SQLAlchemy async operations require proper greenlet setup.
   The error "greenlet_spawn has not been called" indicates this issue.

2. Solution options:
   - Use synchronous endpoints for testing (as in this file)
   - Properly configure greenlet_spawn in conftest.py (see example below)
   - Use proper async context management for SQLAlchemy operations

3. Example of greenlet_spawn configuration:

```python
from sqlalchemy.util import greenlet_spawn as sa_greenlet_spawn

def run_in_greenlet(fn, *args, **kwargs):
    current = greenlet.getcurrent()
    result = greenlet.greenlet(fn).switch(*args, **kwargs)
    return result

# Monkey patch SQLAlchemy's greenlet_spawn
sa_greenlet_spawn.greenlet_spawn = run_in_greenlet
```

4. Using AsyncClient with override_get_async_db and dependencies:

```python
# Fixture for async client with async DB dependency override
@pytest_asyncio.fixture(scope="function")
async def async_client(async_db: AsyncSession):
    # Override the get_async_db dependency
    async def override_get_async_db():
        try:
            yield async_db
        finally:
            pass
    
    # Create a test user for auth
    user = User(...)
    async_db.add(user)
    await async_db.commit()
    
    # Override auth dependencies
    async def override_get_current_user_async():
        return user
    
    # Apply overrides
    app.dependency_overrides[get_async_db] = override_get_async_db
    app.dependency_overrides[deps.get_current_user_async] = override_get_current_user_async
    
    # Create async test client
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as test_client:
        yield test_client
    
    # Clear overrides
    app.dependency_overrides.clear()
```
""" 