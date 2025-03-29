import pytest
import asyncio
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.api.v1.users.favorites import router
from app.models.user import User
from app.models.song import Song
from app.models.user_song import UserSong
from app.services.favorites import get_user_favorites_async, add_to_favorites_async


# Simple test to verify that the favorites API is working
def test_favorites_api_routes():
    """Test that the favorites API routes are registered."""
    routes = [route.path for route in router.routes]
    assert "/" in routes
    assert "/{song_id}" in routes
    assert "/{song_id}/check" in routes

    # Find the methods for each route
    methods = {}
    for route in router.routes:
        if route.path not in methods:
            methods[route.path] = set()
        methods[route.path].update(route.methods)
    
    assert "GET" in methods["/"]
    assert "POST" in methods["/"]
    assert "DELETE" in methods["/{song_id}"]
    assert "GET" in methods["/{song_id}/check"]


# Simple test to verify that our async functions are properly defined
def test_async_services_exist():
    """Test that our async services exist and have the correct signature."""
    # Verify that the async functions have async/await syntax
    assert asyncio.iscoroutinefunction(get_user_favorites_async)
    assert asyncio.iscoroutinefunction(add_to_favorites_async)


# Test for synchronous API to verify that the basic functionality works
def test_synchronous_favorites_api(
    client: TestClient,
    test_db_user: User,
    auth_headers: dict,
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
        headers=auth_headers,
        json={"song_id": song.id}
    )
    assert response.status_code == 201
    
    # Test getting favorites
    response = client.get(
        "/api/v1/users/me/favorites",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    
    # Test checking favorite status
    response = client.get(
        f"/api/v1/users/me/favorites/{song.id}/check",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json() is True
    
    # Test removing from favorites
    response = client.delete(
        f"/api/v1/users/me/favorites/{song.id}",
        headers=auth_headers
    )
    assert response.status_code == 204
    
    # Verify it was removed
    response = client.get(
        f"/api/v1/users/me/favorites/{song.id}/check",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json() is False 