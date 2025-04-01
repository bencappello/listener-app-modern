from typing import Dict

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.core.config import settings
from app.schemas.tags.tag import TagCreate
from app.utils import random_string
from app.models.tag import Tag

pytestmark = pytest.mark.asyncio

async def test_create_tag(
    client: TestClient,
    superuser_token_headers: Dict[str, str],
    async_db_session: AsyncSession
) -> None:
    """Test creating a tag via API."""
    name = f"Test Tag {random_string()}"
    description = "A test tag description"
    data = {"name": name, "description": description}
    
    response = client.post(
        f"{settings.API_V1_STR}/tags/",
        headers=superuser_token_headers,
        json=data,
    )
    
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == name
    assert content["description"] == description
    assert "id" in content
    assert "created_at" in content
    assert "updated_at" in content

async def test_create_tag_no_description(
    client: TestClient,
    superuser_token_headers: Dict[str, str],
    async_db_session: AsyncSession
) -> None:
    """Test creating a tag without a description."""
    name = f"Test Tag {random_string()}"
    data = {"name": name}
    
    response = client.post(
        f"{settings.API_V1_STR}/tags/",
        headers=superuser_token_headers,
        json=data,
    )
    
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == name
    assert content["description"] is None

async def test_create_duplicate_tag(
    client: TestClient,
    superuser_token_headers: Dict[str, str],
    async_db_session: AsyncSession
) -> None:
    """Test that creating a duplicate tag returns an error."""
    name = f"Test Tag {random_string()}"
    data = {"name": name}
    
    # Create first tag
    response = client.post(
        f"{settings.API_V1_STR}/tags/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    
    # Try to create duplicate tag
    response = client.post(
        f"{settings.API_V1_STR}/tags/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 400

async def test_read_tag(
    client: TestClient,
    superuser_token_headers: Dict[str, str],
    async_db_session: AsyncSession
) -> None:
    """Test retrieving a tag by ID."""
    # Create a tag
    tag = Tag(name=f"Test Tag {random_string()}")
    async_db_session.add(tag)
    await async_db_session.commit()
    await async_db_session.refresh(tag)
    
    response = client.get(
        f"{settings.API_V1_STR}/tags/{tag.id}",
        headers=superuser_token_headers,
    )
    
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == tag.name
    assert content["id"] == tag.id

async def test_read_nonexistent_tag(
    client: TestClient,
    superuser_token_headers: Dict[str, str]
) -> None:
    """Test retrieving a nonexistent tag."""
    response = client.get(
        f"{settings.API_V1_STR}/tags/999999",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404

async def test_read_tags(
    client: TestClient,
    superuser_token_headers: Dict[str, str],
    async_db_session: AsyncSession
) -> None:
    """Test retrieving multiple tags."""
    # Create some tags
    tags = []
    for i in range(3):
        tag = Tag(name=f"Test Tag {random_string()}")
        async_db_session.add(tag)
        tags.append(tag)
    await async_db_session.commit()
    for tag in tags:
        await async_db_session.refresh(tag)
    
    response = client.get(
        f"{settings.API_V1_STR}/tags/",
        headers=superuser_token_headers,
    )
    
    assert response.status_code == 200
    content = response.json()
    assert len(content) >= 3  # There might be other tags in the DB
    for tag in tags:
        assert any(t["id"] == tag.id for t in content)

async def test_update_tag(
    client: TestClient,
    superuser_token_headers: Dict[str, str],
    async_db_session: AsyncSession
) -> None:
    """Test updating a tag."""
    # Create a tag
    tag = Tag(name=f"Test Tag {random_string()}")
    async_db_session.add(tag)
    await async_db_session.commit()
    await async_db_session.refresh(tag)
    
    # Update the tag
    new_name = f"Updated Tag {random_string()}"
    data = {"name": new_name, "description": "Updated description"}
    
    response = client.put(
        f"{settings.API_V1_STR}/tags/{tag.id}",
        headers=superuser_token_headers,
        json=data,
    )
    
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == new_name
    assert content["description"] == "Updated description"
    assert content["id"] == tag.id

async def test_update_nonexistent_tag(
    client: TestClient,
    superuser_token_headers: Dict[str, str]
) -> None:
    """Test updating a nonexistent tag."""
    data = {"name": "Updated Tag", "description": "Updated description"}
    
    response = client.put(
        f"{settings.API_V1_STR}/tags/999999",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 404

async def test_delete_tag(
    client: TestClient,
    superuser_token_headers: Dict[str, str],
    async_db_session: AsyncSession
) -> None:
    """Test deleting a tag."""
    # Create a tag
    tag = Tag(name=f"Test Tag {random_string()}")
    async_db_session.add(tag)
    await async_db_session.commit()
    await async_db_session.refresh(tag)
    
    response = client.delete(
        f"{settings.API_V1_STR}/tags/{tag.id}",
        headers=superuser_token_headers,
    )
    
    assert response.status_code == 200
    content = response.json()
    assert content["id"] == tag.id
    assert content["name"] == tag.name
    
    # Verify tag is deleted
    response = client.get(
        f"{settings.API_V1_STR}/tags/{tag.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404

async def test_delete_nonexistent_tag(
    client: TestClient,
    superuser_token_headers: Dict[str, str]
) -> None:
    """Test deleting a nonexistent tag."""
    response = client.delete(
        f"{settings.API_V1_STR}/tags/999999",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404 