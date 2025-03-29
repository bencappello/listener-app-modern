import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.blog import Blog
from app.db.session import SessionLocal

pytestmark = pytest.mark.asyncio


async def test_create_blog(db_session: AsyncSession) -> None:
    """Test creating a new blog."""
    # Create a new blog
    blog = Blog(
        name="Test Blog",
        url="https://testblog.com",
        description="A test blog for unit testing",
        rss_feed_url="https://testblog.com/rss",
        is_active=True,
    )
    
    # Add to session and commit
    db_session.add(blog)
    await db_session.commit()
    await db_session.refresh(blog)
    
    # Assert that the blog was created with the correct attributes
    assert blog.id is not None
    assert blog.name == "Test Blog"
    assert blog.url == "https://testblog.com"
    assert blog.description == "A test blog for unit testing"
    assert blog.rss_feed_url == "https://testblog.com/rss"
    assert blog.is_active is True
    assert blog.created_at is not None
    assert blog.updated_at is not None


async def test_update_blog(db_session: AsyncSession) -> None:
    """Test updating a blog."""
    # Create a new blog
    blog = Blog(
        name="Original Blog",
        url="https://originalblog.com",
        description="Original description",
        is_active=True,
    )
    
    # Add to session and commit
    db_session.add(blog)
    await db_session.commit()
    await db_session.refresh(blog)
    
    # Update blog attributes
    blog_id = blog.id
    blog.name = "Updated Blog"
    blog.description = "Updated description"
    blog.is_active = False
    
    # Commit the changes
    await db_session.commit()
    await db_session.refresh(blog)
    
    # Assert that the blog was updated with the correct attributes
    assert blog.id == blog_id
    assert blog.name == "Updated Blog"
    assert blog.description == "Updated description"
    assert blog.is_active is False


async def test_delete_blog(db_session: AsyncSession) -> None:
    """Test deleting a blog."""
    # Create a new blog
    blog = Blog(
        name="Temporary Blog",
        url="https://tempblog.com",
        is_active=True,
    )
    
    # Add to session and commit
    db_session.add(blog)
    await db_session.commit()
    
    # Get the blog ID
    blog_id = blog.id
    
    # Delete the blog
    await db_session.delete(blog)
    await db_session.commit()
    
    # Try to get the blog by ID
    result = await db_session.execute(select(Blog).where(Blog.id == blog_id))
    deleted_blog = result.scalars().first()
    
    # Assert that the blog was deleted
    assert deleted_blog is None


def test_create_blog_sync() -> None:
    """Test creating a blog using synchronous session."""
    # Use a synchronous session
    with SessionLocal() as db:
        # Create a new blog
        blog = Blog(
            name="Sync Test Blog",
            url="https://synctestblog.com",
            description="A test blog for sync testing",
            is_active=True,
        )
        
        # Add to session and commit
        db.add(blog)
        db.commit()
        db.refresh(blog)
        
        # Assert that the blog was created with the correct attributes
        assert blog.id is not None
        assert blog.name == "Sync Test Blog"
        assert blog.url == "https://synctestblog.com"
        assert blog.description == "A test blog for sync testing"
        assert blog.is_active is True
        assert blog.created_at is not None
        assert blog.updated_at is not None
        
        # Clean up - delete the blog
        db.delete(blog)
        db.commit() 