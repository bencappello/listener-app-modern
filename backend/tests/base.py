"""
Base test class for all backend tests.
"""
import pytest
from typing import Generator, Dict, Any, Optional
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from tests.utils import create_test_user, get_auth_header


class BaseTest:
    """Base test class with common test utilities."""
    
    @pytest.fixture(autouse=True)
    def setup(self, client: TestClient, db: Session) -> None:
        """
        Setup test case.
        
        Args:
            client: TestClient instance
            db: Database session
        """
        self.client = client
        self.db = db
        settings.DEBUG = True
    
    def create_user(
        self,
        email: Optional[str] = None,
        username: Optional[str] = None,
        password: str = "password123"
    ) -> Dict[str, Any]:
        """
        Create a test user.
        
        Args:
            email: User email (optional)
            username: Username (optional)
            password: User password
            
        Returns:
            Dict[str, Any]: User data
        """
        return create_test_user(self.db, email, username, password)
    
    def get_auth_header(self, email: str, password: str) -> Dict[str, str]:
        """
        Get authorization header with JWT token.
        
        Args:
            email: User email
            password: User password
            
        Returns:
            Dict[str, str]: Authorization header
        """
        return get_auth_header(self.client, email, password)
    
    def create_user_and_login(
        self,
        email: Optional[str] = None,
        username: Optional[str] = None,
        password: str = "password123"
    ) -> tuple[Dict[str, Any], Dict[str, str]]:
        """
        Create a test user and get auth header.
        
        Args:
            email: User email (optional)
            username: Username (optional)
            password: User password
            
        Returns:
            Tuple[Dict[str, Any], Dict[str, str]]: User data and auth header
        """
        user = self.create_user(email, username, password)
        
        # Register the user through the API
        # This will be changed once the auth endpoints are implemented
        self.client.post(
            "/api/auth/register",
            json={
                "email": user["email"],
                "username": user["username"],
                "password": user["password"]
            }
        )
        
        # Get auth header
        headers = self.get_auth_header(user["email"], user["password"])
        return user, headers 