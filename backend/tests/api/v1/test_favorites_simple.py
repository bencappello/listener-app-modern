import pytest
import asyncio
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from httpx import AsyncClient

from app.api.v1.users.favorites import router
from app.models.user import User
from app.models.song import Song
from app.models.user_song import UserSong
from app.services.favorites import get_user_favorites_async, add_to_favorites_async
from main import app


# Simple test to verify that the favorites API is working
def test_favorites_api_routes(client: TestClient):
    """Test that the favorites API routes are properly defined."""
    # Check the route definitions for users/me/favorites
    # Get the FastAPI app's routes
    routes = [
        {"path": route.path, "methods": route.methods}
        for route in app.routes 
        if "/users/me/favorites" in route.path
    ]
    
    # Verify that we have routes for favorites
    assert len(routes) >= 3, "Missing favorites API routes"
    
    # Check that all the required paths with correct methods exist
    # Note: FastAPI sometimes adds trailing slashes to paths
    found_paths = {
        "main_path": False,
        "song_id_path": False,
        "check_path": False
    }
    
    for route in routes:
        path = route["path"]
        methods = route["methods"]
        
        if path in ["/api/v1/users/me/favorites", "/api/v1/users/me/favorites/"]:
            found_paths["main_path"] = True
            assert "GET" in methods
        elif path in ["/api/v1/users/me/favorites/{song_id}", "/api/v1/users/me/favorites/{song_id}/"]:
            found_paths["song_id_path"] = True
            assert any(method in methods for method in ["POST", "DELETE"])
        elif path in ["/api/v1/users/me/favorites/{song_id}/check", "/api/v1/users/me/favorites/{song_id}/check/"]:
            found_paths["check_path"] = True
            assert "GET" in methods
    
    # Verify that all required paths were found
    assert found_paths["main_path"], "Main favorites path not found"
    assert found_paths["song_id_path"], "Song ID path not found"
    assert found_paths["check_path"], "Check path not found"


# Simple test to verify that our async functions are properly defined
def test_async_services_exist():
    """Test that our async services exist and have the correct signature."""
    # Verify that the async functions have async/await syntax
    assert asyncio.iscoroutinefunction(get_user_favorites_async)
    assert asyncio.iscoroutinefunction(add_to_favorites_async)


# Test for synchronous API to verify that the basic functionality works
def test_synchronous_favorites_api(
    client: TestClient,
    db: Session
):
    """Test the favorites API using synchronous client."""
    # Create a test song
    song = Song(
        title="Test Sync API Song",
        duration=180,
        file_path="/path/to/test_sync_song.mp3"
    )
    db.add(song)
    db.commit()
    db.refresh(song)
    
    # Test adding a song to favorites
    response = client.post(
        "/api/v1/users/me/favorites",
        json={"song_id": song.id}
    )
    assert response.status_code == 201
    
    # Test getting favorites
    response = client.get(
        "/api/v1/users/me/favorites"
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    
    # Test checking favorite status
    response = client.get(
        f"/api/v1/users/me/favorites/{song.id}/check"
    )
    assert response.status_code == 200
    assert response.json() is True
    
    # Test removing from favorites
    response = client.delete(
        f"/api/v1/users/me/favorites/{song.id}"
    )
    assert response.status_code == 204
    
    # Verify it was removed
    response = client.get(
        f"/api/v1/users/me/favorites/{song.id}/check"
    )
    assert response.status_code == 200
    assert response.json() is False


def test_favorites_router_endpoints():
    """Test that the favorites router has the expected endpoints."""
    # Get all routes from the router
    routes = router.routes
    
    # Create a dictionary of paths to their methods
    endpoints = {}
    for route in routes:
        if route.path not in endpoints:
            endpoints[route.path] = set()
        endpoints[route.path].update(route.methods)
    
    # Verify the main endpoints exist
    assert "/" in endpoints
    assert "/{song_id}" in endpoints
    assert "/{song_id}/check" in endpoints
    
    # Verify the methods
    assert "GET" in endpoints["/"]
    assert "POST" in endpoints["/"]
    assert "DELETE" in endpoints["/{song_id}"]
    assert "GET" in endpoints["/{song_id}/check"]
    
    # Count the number of routes (should be 4)
    assert len(routes) == 4, f"Expected 4 routes, got {len(routes)}" 