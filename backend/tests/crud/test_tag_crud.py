import pytest
from sqlalchemy.orm import Session

from app import crud
from app.schemas.tags.tag import TagCreate, TagUpdate
from app.models import Tag
from app.utils import random_string

def test_create_tag(db_session: Session):
    """Test creating a tag through CRUD operations."""
    name = f"Test Tag {random_string()}"
    description = "A test tag description"
    tag_in = TagCreate(name=name, description=description)
    
    tag = crud.tag.create_sync(db_session, obj_in=tag_in)
    
    assert tag.name == name
    assert tag.description == description
    assert tag.id is not None
    assert tag.created_at is not None
    assert tag.updated_at is not None

def test_get_tag(db_session: Session):
    """Test retrieving a tag by ID."""
    # Create a tag
    name = f"Test Tag {random_string()}"
    tag_in = TagCreate(name=name)
    tag = crud.tag.create_sync(db_session, obj_in=tag_in)
    
    # Retrieve the tag
    stored_tag = crud.tag.get(db_session, id=tag.id)
    
    assert stored_tag
    assert stored_tag.id == tag.id
    assert stored_tag.name == name
    assert stored_tag.created_at == tag.created_at

def test_get_tag_by_name(db_session: Session):
    """Test retrieving a tag by name."""
    # Create a tag
    name = f"Test Tag {random_string()}"
    tag_in = TagCreate(name=name)
    tag = crud.tag.create_sync(db_session, obj_in=tag_in)
    
    # Retrieve the tag by name
    stored_tag = crud.tag.get_by_name_sync(db_session, name=name)
    
    assert stored_tag
    assert stored_tag.id == tag.id
    assert stored_tag.name == name

def test_get_nonexistent_tag(db_session: Session):
    """Test retrieving a nonexistent tag."""
    tag = crud.tag.get(db_session, id=999999)
    assert tag is None

def test_get_multi_tags(db_session: Session):
    """Test retrieving multiple tags with pagination."""
    # Create multiple tags
    tags = []
    for i in range(3):
        name = f"Test Tag {random_string()}"
        tag_in = TagCreate(name=name)
        tag = crud.tag.create_sync(db_session, obj_in=tag_in)
        tags.append(tag)
    
    # Retrieve tags with pagination
    stored_tags = crud.tag.get_multi(db_session, skip=0, limit=10)
    
    assert len(stored_tags) >= 3  # There might be other tags in the DB
    for tag in tags:
        assert any(s.id == tag.id for s in stored_tags)

def test_update_tag(db_session: Session):
    """Test updating a tag."""
    # Create a tag
    name = f"Test Tag {random_string()}"
    tag_in = TagCreate(name=name)
    tag = crud.tag.create_sync(db_session, obj_in=tag_in)
    
    # Store the original updated_at timestamp
    original_updated_at = tag.updated_at
    
    # Update the tag
    new_name = f"Updated Tag {random_string()}"
    new_description = "Updated description"
    tag_update = TagUpdate(name=new_name, description=new_description)
    
    updated_tag = crud.tag.update_sync(db_session, db_obj=tag, obj_in=tag_update)
    
    assert updated_tag.id == tag.id
    assert updated_tag.name == new_name
    assert updated_tag.description == new_description
    assert updated_tag.updated_at > original_updated_at

def test_delete_tag(db_session: Session):
    """Test deleting a tag."""
    # Create a tag
    name = f"Test Tag {random_string()}"
    tag_in = TagCreate(name=name)
    tag = crud.tag.create_sync(db_session, obj_in=tag_in)
    
    # Delete the tag
    deleted_tag = crud.tag.remove(db_session, id=tag.id)
    
    assert deleted_tag.id == tag.id
    assert deleted_tag.name == name
    
    # Verify tag is deleted
    db_tag = crud.tag.get(db_session, id=tag.id)
    assert db_tag is None

def test_delete_nonexistent_tag(db_session: Session):
    """Test deleting a nonexistent tag."""
    # Try to delete a nonexistent tag
    deleted_tag = crud.tag.get(db_session, id=999999)
    assert deleted_tag is None 