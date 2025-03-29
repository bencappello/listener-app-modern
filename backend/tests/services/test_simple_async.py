import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

from app.models.user import User


@pytest.mark.asyncio
async def test_async_db_operations(async_db: AsyncSession):
    """Test basic async database operations."""
    
    # Create a test user
    user = User(
        email="test_async_ops@example.com",
        username="test_async_ops",
        password="password123",
        is_active=True
    )
    
    # Add to database
    async_db.add(user)
    await async_db.commit()
    
    # Query to verify using SQLAlchemy constructs
    stmt = select(User).where(User.email == "test_async_ops@example.com")
    result = await async_db.execute(stmt)
    fetched_user = result.scalars().first()
    
    # Verify user was created
    assert fetched_user is not None
    assert fetched_user.username == "test_async_ops" 