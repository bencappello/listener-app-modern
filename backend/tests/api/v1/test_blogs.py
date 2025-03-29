import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.core.security import create_access_token
from app.models.blog import Blog
from app.models.user import User
from app.api.deps import get_current_active_superuser

pytestmark = pytest.mark.asyncio


# Override the dependency to get current superuser
def get_current_active_superuser_override():
    return User(
        id=1,
        email="admin@example.com",
        username="admin",
        password="hashed_password",
        is_active=True,
    )


app.dependency_overrides[get_current_active_superuser] = get_current_active_superuser_override


@pytest.fixture
def superuser_token_headers():
    """Return superuser token headers."""
    access_token = create_access_token({"sub": "1", "is_superuser": True})
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def user_token_headers():
    """Return normal user token headers."""
    access_token = create_access_token({"sub": "2", "is_superuser": False})
    return {"Authorization": f"Bearer {access_token}"}


async def test_create_blog(db_session: AsyncSession, superuser_token_headers: dict) -> None:
    """Test creating a blog via API."""
    # Data for a new blog
    blog_data = {
        "name": "API Test Blog",
        "url": "https://apitestblog.com",
        "description": "Blog created via API test",
        "rss_feed_url": "https://apitestblog.com/rss",
        "is_active": True,
    }
    
    # Use the test client to make a request
    with TestClient(app) as client:
        response = client.post(
            "/api/blogs/",
            headers=superuser_token_headers,
            json=blog_data,
        )
    
    # Assert response
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == blog_data["name"]
    assert data["url"] == blog_data["url"]
    assert data["description"] == blog_data["description"]
    assert data["rss_feed_url"] == blog_data["rss_feed_url"]
    assert data["is_active"] == blog_data["is_active"]
    
    # Verify it was created in the database
    blog_id = data["id"]
    result = await db_session.execute(select(Blog).where(Blog.id == blog_id))
    blog = result.scalars().first()
    assert blog is not None
    
    # Clean up
    await db_session.delete(blog)
    await db_session.commit()


async def test_get_blogs(db_session: AsyncSession, user_token_headers: dict) -> None:
    """Test retrieving blogs via API."""
    # Create test blogs
    blog1 = Blog(name="Test Blog 1", url="https://testblog1.com", is_active=True)
    blog2 = Blog(name="Test Blog 2", url="https://testblog2.com", is_active=True)
    db_session.add_all([blog1, blog2])
    await db_session.commit()
    
    # Use the test client to make a request
    with TestClient(app) as client:
        response = client.get(
            "/api/blogs/",
            headers=user_token_headers,
        )
    
    # Assert response
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2  # At least the two we added
    
    # Clean up
    await db_session.delete(blog1)
    await db_session.delete(blog2)
    await db_session.commit()


async def test_get_blog(db_session: AsyncSession, user_token_headers: dict) -> None:
    """Test retrieving a specific blog via API."""
    # Create test blog
    blog = Blog(
        name="Specific Blog",
        url="https://specificblog.com",
        description="Blog for specific retrieval test",
        is_active=True,
    )
    db_session.add(blog)
    await db_session.commit()
    await db_session.refresh(blog)
    
    # Use the test client to make a request
    with TestClient(app) as client:
        response = client.get(
            f"/api/blogs/{blog.id}",
            headers=user_token_headers,
        )
    
    # Assert response
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == blog.id
    assert data["name"] == blog.name
    assert data["url"] == blog.url
    assert data["description"] == blog.description
    
    # Clean up
    await db_session.delete(blog)
    await db_session.commit()


async def test_update_blog(db_session: AsyncSession, superuser_token_headers: dict) -> None:
    """Test updating a blog via API."""
    # Create test blog
    blog = Blog(
        name="Original Blog",
        url="https://originalblog.com",
        description="Original description",
        is_active=True,
    )
    db_session.add(blog)
    await db_session.commit()
    await db_session.refresh(blog)
    
    # Data for the update
    update_data = {
        "name": "Updated API Blog",
        "description": "Updated via API test",
        "is_active": False,
    }
    
    # Use the test client to make a request
    with TestClient(app) as client:
        response = client.put(
            f"/api/blogs/{blog.id}",
            headers=superuser_token_headers,
            json=update_data,
        )
    
    # Assert response
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == blog.id
    assert data["name"] == update_data["name"]
    assert data["description"] == update_data["description"]
    assert data["is_active"] == update_data["is_active"]
    assert data["url"] == blog.url  # Not updated
    
    # Verify it was updated in the database
    await db_session.refresh(blog)
    assert blog.name == update_data["name"]
    assert blog.description == update_data["description"]
    assert blog.is_active == update_data["is_active"]
    
    # Clean up
    await db_session.delete(blog)
    await db_session.commit()


async def test_delete_blog(db_session: AsyncSession, superuser_token_headers: dict) -> None:
    """Test deleting a blog via API."""
    # Create test blog
    blog = Blog(
        name="Blog to Delete",
        url="https://blogtodelete.com",
        is_active=True,
    )
    db_session.add(blog)
    await db_session.commit()
    await db_session.refresh(blog)
    
    blog_id = blog.id
    
    # Use the test client to make a request
    with TestClient(app) as client:
        response = client.delete(
            f"/api/blogs/{blog_id}",
            headers=superuser_token_headers,
        )
    
    # Assert response
    assert response.status_code == 200
    
    # Verify it was deleted from the database
    result = await db_session.execute(select(Blog).where(Blog.id == blog_id))
    deleted_blog = result.scalars().first()
    assert deleted_blog is None 