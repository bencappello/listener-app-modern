"""
Tests for the health check endpoint.
"""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

# Create a simple FastAPI app for testing
app = FastAPI()

# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "0.1.0"}

# Create a test client
@pytest.fixture
def client():
    return TestClient(app)

def test_health_check(client: TestClient) -> None:
    """Test that the health check endpoint returns 200 OK."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data 