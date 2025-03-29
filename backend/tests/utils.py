"""
Test utilities for backend tests.
"""
import random
import string
from typing import Dict, Any, Optional

from sqlalchemy.orm import Session
from fastapi.testclient import TestClient


def random_string(length: int = 10) -> str:
    """
    Generate a random string of specified length.
    
    Args:
        length: Length of the string to generate
        
    Returns:
        str: Random string
    """
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for _ in range(length))


def random_email() -> str:
    """
    Generate a random email address.
    
    Returns:
        str: Random email address
    """
    return f"{random_string(8)}@{random_string(6)}.com"


def get_auth_header(client: TestClient, email: str, password: str) -> Dict[str, str]:
    """
    Get authorization header with JWT token.
    
    Args:
        client: TestClient instance
        email: User email
        password: User password
        
    Returns:
        Dict[str, str]: Authorization header
    """
    response = client.post(
        "/api/auth/login",
        json={"email": email, "password": password}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_test_user(
    db: Session,
    email: Optional[str] = None,
    username: Optional[str] = None,
    password: str = "password123"
) -> Dict[str, Any]:
    """
    Create a test user in the database.
    This is a placeholder - to be implemented in Step 7 when we implement the User model.
    
    Args:
        db: Database session
        email: User email (optional, will generate random if not provided)
        username: Username (optional, will generate random if not provided)
        password: User password
        
    Returns:
        Dict[str, Any]: User data
    """
    # This will be implemented in Step 7
    # For now, return a mock user dict to make tests work
    return {
        "id": 1,
        "email": email or random_email(),
        "username": username or random_string(8),
        "password": password,
    } 