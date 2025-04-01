from typing import Dict

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.core.config import settings
from app.schemas.tags.tag import TagCreate, TagUpdate
from app.utils import random_string

pytestmark = pytest.mark.asyncio

@pytest.mark.asyncio
async def test_create_tag(
    async_client: TestClient,
    async_db_session: AsyncSession,
) -> None:
    tag_data = {"name": "test_tag", "description": "Test tag description"}
    response = await async_client.post("/api/v1/tags/", json=tag_data)
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == tag_data["name"]
    assert content["description"] == tag_data["description"]

@pytest.mark.asyncio
async def test_create_tag_no_description(
    async_client: TestClient,
    async_db_session: AsyncSession,
) -> None:
    tag_data = {"name": "test_tag_no_desc"}
    response = await async_client.post("/api/v1/tags/", json=tag_data)
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == tag_data["name"]
    assert content["description"] is None

@pytest.mark.asyncio
async def test_create_duplicate_tag(
    async_client: TestClient,
    async_db_session: AsyncSession,
) -> None:
    tag_data = {"name": "duplicate_tag", "description": "Test tag description"}
    response = await async_client.post("/api/v1/tags/", json=tag_data)
    assert response.status_code == 200
    
    # Try to create the same tag again
    response = await async_client.post("/api/v1/tags/", json=tag_data)
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_read_tag(
    async_client: TestClient,
    async_db_session: AsyncSession,
) -> None:
    # Create a tag first
    tag_data = {"name": "test_tag_read", "description": "Test tag description"}
    response = await async_client.post("/api/v1/tags/", json=tag_data)
    assert response.status_code == 200
    tag_id = response.json()["id"]
    
    # Read the tag
    response = await async_client.get(f"/api/v1/tags/{tag_id}")
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == tag_data["name"]
    assert content["description"] == tag_data["description"]

@pytest.mark.asyncio
async def test_read_nonexistent_tag(
    async_client: TestClient,
    async_db_session: AsyncSession,
) -> None:
    response = await async_client.get("/api/v1/tags/999999")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_read_tags(
    async_client: TestClient,
    async_db_session: AsyncSession,
) -> None:
    # Create multiple tags
    tag_names = ["tag1", "tag2", "tag3"]
    for name in tag_names:
        tag_data = {"name": name, "description": f"Description for {name}"}
        response = await async_client.post("/api/v1/tags/", json=tag_data)
        assert response.status_code == 200
    
    # Read all tags
    response = await async_client.get("/api/v1/tags/")
    assert response.status_code == 200
    content = response.json()
    assert len(content) >= 3
    assert all(tag["name"] in tag_names for tag in content[:3])

@pytest.mark.asyncio
async def test_update_tag(
    async_client: TestClient,
    async_db_session: AsyncSession,
) -> None:
    # Create a tag first
    tag_data = {"name": "test_tag_update", "description": "Original description"}
    response = await async_client.post("/api/v1/tags/", json=tag_data)
    assert response.status_code == 200
    tag_id = response.json()["id"]
    
    # Update the tag
    update_data = {"name": "updated_tag", "description": "Updated description"}
    response = await async_client.put(f"/api/v1/tags/{tag_id}", json=update_data)
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == update_data["name"]
    assert content["description"] == update_data["description"]

@pytest.mark.asyncio
async def test_update_nonexistent_tag(
    async_client: TestClient,
    async_db_session: AsyncSession,
) -> None:
    update_data = {"name": "nonexistent_tag", "description": "Updated description"}
    response = await async_client.put("/api/v1/tags/999999", json=update_data)
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_delete_tag(
    async_client: TestClient,
    async_db_session: AsyncSession,
) -> None:
    # Create a tag first
    tag_data = {"name": "test_tag_delete", "description": "Test tag description"}
    response = await async_client.post("/api/v1/tags/", json=tag_data)
    assert response.status_code == 200
    tag_id = response.json()["id"]
    
    # Delete the tag
    response = await async_client.delete(f"/api/v1/tags/{tag_id}")
    assert response.status_code == 200
    
    # Verify tag is deleted
    response = await async_client.get(f"/api/v1/tags/{tag_id}")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_delete_nonexistent_tag(
    async_client: TestClient,
    async_db_session: AsyncSession,
) -> None:
    response = await async_client.delete("/api/v1/tags/999999")
    assert response.status_code == 404 