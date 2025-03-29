"""
Tests for the health check endpoint.
"""
import pytest
from fastapi.testclient import TestClient

from main import app


def test_health_check(client: TestClient) -> None:
    """Test that the health check endpoint returns 200 OK."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data 