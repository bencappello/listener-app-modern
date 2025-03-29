import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from httpx import AsyncClient

from app.models.band import Band


class TestBandEndpoints:
    """Test suite for band endpoints."""

    def test_create_band(self, client: TestClient, auth_headers: dict):
        """Test creating a new band."""
        response = client.post(
            "/api/v1/bands",
            headers=auth_headers,
            json={
                "name": "New Band",
                "description": "A band created through the API",
                "image_url": "https://example.com/newband.jpg"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["name"] == "New Band"
        assert data["description"] == "A band created through the API"
        assert data["image_url"] == "https://example.com/newband.jpg"

    @pytest.mark.asyncio
    async def test_create_band_async(self, async_client: AsyncClient, async_auth_headers: dict):
        """Test creating a new band (async)."""
        response = await async_client.post(
            "/api/v1/bands/async",
            headers=async_auth_headers,
            json={
                "name": "New Async Band",
                "description": "A band created through the async API",
                "image_url": "https://example.com/newasyncband.jpg"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["name"] == "New Async Band"
        assert data["description"] == "A band created through the async API"
        assert data["image_url"] == "https://example.com/newasyncband.jpg"

    def test_create_band_duplicate_name(self, client: TestClient, auth_headers: dict, db_session: Session):
        """Test creating a band with duplicate name."""
        # Create band in database
        band = Band(name="Existing Band", description="A band that already exists")
        db_session.add(band)
        db_session.commit()
        
        # Try to create band with same name
        response = client.post(
            "/api/v1/bands",
            headers=auth_headers,
            json={
                "name": "Existing Band",
                "description": "Another band with same name"
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "already exists" in data["detail"].lower()

    @pytest.mark.asyncio
    async def test_create_band_duplicate_name_async(self, async_client: AsyncClient, async_auth_headers: dict, async_db_session: AsyncSession):
        """Test creating a band with duplicate name (async)."""
        # Create band in database
        band = Band(name="Existing Async Band", description="A band that already exists in async")
        async_db_session.add(band)
        await async_db_session.commit()
        
        # Try to create band with same name
        response = await async_client.post(
            "/api/v1/bands/async",
            headers=async_auth_headers,
            json={
                "name": "Existing Async Band",
                "description": "Another band with same name in async"
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "already exists" in data["detail"].lower()

    def test_get_band(self, client: TestClient, db_session: Session):
        """Test getting a single band."""
        # Create band in database
        band = Band(
            name="Get Test Band", 
            description="A band to retrieve",
            image_url="https://example.com/getband.jpg"
        )
        db_session.add(band)
        db_session.commit()
        
        # Retrieve band
        response = client.get(f"/api/v1/bands/{band.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == band.id
        assert data["name"] == band.name
        assert data["description"] == band.description
        assert data["image_url"] == band.image_url

    @pytest.mark.asyncio
    async def test_get_band_async(self, async_client: AsyncClient, async_db_session: AsyncSession):
        """Test getting a single band (async)."""
        # Create band in database
        band = Band(
            name="Get Test Async Band", 
            description="A band to retrieve via async",
            image_url="https://example.com/getasyncband.jpg"
        )
        async_db_session.add(band)
        await async_db_session.commit()
        await async_db_session.refresh(band)
        
        # Retrieve band
        response = await async_client.get(f"/api/v1/bands/async/{band.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == band.id
        assert data["name"] == band.name
        assert data["description"] == band.description
        assert data["image_url"] == band.image_url

    def test_get_nonexistent_band(self, client: TestClient):
        """Test getting a band that doesn't exist."""
        response = client.get("/api/v1/bands/9999")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()

    @pytest.mark.asyncio
    async def test_get_nonexistent_band_async(self, async_client: AsyncClient):
        """Test getting a band that doesn't exist (async)."""
        response = await async_client.get("/api/v1/bands/async/9999")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()

    def test_update_band(self, client: TestClient, auth_headers: dict, db_session: Session):
        """Test updating a band."""
        # Create band in database
        band = Band(name="Update Test Band", description="A band to update")
        db_session.add(band)
        db_session.commit()
        
        # Update band
        response = client.put(
            f"/api/v1/bands/{band.id}",
            headers=auth_headers,
            json={
                "name": "Updated Band Name",
                "description": "Updated description",
                "image_url": "https://example.com/updatedband.jpg"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == band.id
        assert data["name"] == "Updated Band Name"
        assert data["description"] == "Updated description"
        assert data["image_url"] == "https://example.com/updatedband.jpg"

    @pytest.mark.asyncio
    async def test_update_band_async(self, async_client: AsyncClient, async_auth_headers: dict, async_db_session: AsyncSession):
        """Test updating a band (async)."""
        # Create band in database
        band = Band(name="Update Test Async Band", description="A band to update via async")
        async_db_session.add(band)
        await async_db_session.commit()
        await async_db_session.refresh(band)
        
        # Update band
        response = await async_client.put(
            f"/api/v1/bands/async/{band.id}",
            headers=async_auth_headers,
            json={
                "name": "Updated Async Band Name",
                "description": "Updated async description",
                "image_url": "https://example.com/updatedasyncband.jpg"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == band.id
        assert data["name"] == "Updated Async Band Name"
        assert data["description"] == "Updated async description"
        assert data["image_url"] == "https://example.com/updatedasyncband.jpg"

    def test_delete_band(self, client: TestClient, auth_headers: dict, db_session: Session):
        """Test deleting a band."""
        # Create band in database
        band = Band(name="Delete Test Band", description="A band to delete")
        db_session.add(band)
        db_session.commit()
        
        # Delete band
        response = client.delete(
            f"/api/v1/bands/{band.id}",
            headers=auth_headers
        )
        assert response.status_code == 200  # Updated from 204 to 200
        
        # Verify band is deleted
        assert db_session.query(Band).filter(Band.id == band.id).first() is None

    @pytest.mark.asyncio
    async def test_delete_band_async(self, async_client: AsyncClient, async_auth_headers: dict, async_db_session: AsyncSession):
        """Test deleting a band (async)."""
        # Create band in database
        band = Band(name="Delete Test Async Band", description="A band to delete via async")
        async_db_session.add(band)
        await async_db_session.commit()
        await async_db_session.refresh(band)
        
        # Delete band
        response = await async_client.delete(
            f"/api/v1/bands/async/{band.id}",
            headers=async_auth_headers
        )
        assert response.status_code == 200
        
        # Verify band is deleted
        from sqlalchemy import select
        result = await async_db_session.execute(select(Band).filter(Band.id == band.id))
        assert result.scalars().first() is None

    def test_list_bands(self, client: TestClient, db_session: Session):
        """Test listing all bands."""
        # Create bands in database
        bands = [
            Band(name="List Test Band 1", description="First band for listing"),
            Band(name="List Test Band 2", description="Second band for listing"),
            Band(name="List Test Band 3", description="Third band for listing")
        ]
        for band in bands:
            db_session.add(band)
        db_session.commit()
        
        # Get list of bands
        response = client.get("/api/v1/bands")
        assert response.status_code == 200
        data = response.json()
        
        # There might be other bands in the database from other tests
        # So we just check that our bands are in the result
        band_names = [band["name"] for band in data]
        for band in bands:
            assert band.name in band_names

    @pytest.mark.asyncio
    async def test_list_bands_async(self, async_client: AsyncClient, async_db_session: AsyncSession):
        """Test listing all bands (async)."""
        # Create bands in database
        bands = [
            Band(name="List Test Async Band 1", description="First async band for listing"),
            Band(name="List Test Async Band 2", description="Second async band for listing"),
            Band(name="List Test Async Band 3", description="Third async band for listing")
        ]
        for band in bands:
            async_db_session.add(band)
        await async_db_session.commit()
        
        # Get list of bands
        response = await async_client.get("/api/v1/bands/async")
        assert response.status_code == 200
        data = response.json()
        
        # There might be other bands in the database from other tests
        # So we just check that our bands are in the result
        band_names = [band["name"] for band in data]
        for band in bands:
            assert band.name in band_names 