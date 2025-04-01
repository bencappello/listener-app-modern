import pytest
from sqlalchemy.orm import Session

from app.crud.crud_blog import crud_blog
from app.schemas.blogs.blog import BlogCreate, BlogUpdate
from app.models.blog import Blog
from app.tests.utils.blog import create_random_blog


def test_create_blog(db_session: Session) -> None:
    """Test creating a new blog."""
    blog_in = BlogCreate(
        name="Test Blog CRUD Create",
        url="https://testblogcrudcreate.com",
        description="Description for CRUD Create test",
        is_active=True
    )
    blog = crud_blog.create(db=db_session, obj_in=blog_in)
    assert blog.name == blog_in.name
    assert blog.url == blog_in.url
    assert blog.description == blog_in.description
    assert blog.is_active == blog_in.is_active
    assert blog.id is not None


def test_get_blog(db_session: Session) -> None:
    """Test getting a blog by ID."""
    blog = create_random_blog(db_session)
    retrieved_blog = crud_blog.get(db=db_session, id=blog.id)
    assert retrieved_blog
    assert retrieved_blog.id == blog.id
    assert retrieved_blog.name == blog.name
    assert retrieved_blog.url == blog.url


def test_get_multi_blog(db_session: Session) -> None:
    """Test getting multiple blogs."""
    blog1 = create_random_blog(db_session, name="Blog1 Multi", url="https://multi1.com")
    blog2 = create_random_blog(db_session, name="Blog2 Multi", url="https://multi2.com")
    blogs = crud_blog.get_multi(db=db_session)
    assert len(blogs) >= 2
    blog_ids = [b.id for b in blogs]
    assert blog1.id in blog_ids
    assert blog2.id in blog_ids


def test_update_blog(db_session: Session) -> None:
    """Test updating an existing blog."""
    blog = create_random_blog(db_session)
    new_description = "Updated Blog Description"
    blog_update_data = BlogUpdate(description=new_description, is_active=False)
    
    updated_blog = crud_blog.update(db=db_session, db_obj=blog, obj_in=blog_update_data)
    assert updated_blog.id == blog.id
    assert updated_blog.name == blog.name # Should not change
    assert updated_blog.description == new_description
    assert updated_blog.is_active is False


def test_remove_blog(db_session: Session) -> None:
    """Test removing a blog."""
    blog = create_random_blog(db_session)
    blog_id = blog.id
    
    removed_blog = crud_blog.remove(db=db_session, id=blog_id)
    assert removed_blog.id == blog_id
    
    blog_after_removal = crud_blog.get(db=db_session, id=blog_id)
    assert blog_after_removal is None 