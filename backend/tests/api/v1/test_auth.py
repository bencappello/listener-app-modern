import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from main import app
from app.models.user import User


class TestAuthEndpoints:
    """Test suite for authentication endpoints."""

    def test_register_success(self, client: TestClient):
        """Test successful user registration."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "username": "newuser",
                "password": "securepassword123"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["email"] == "newuser@example.com"
        assert data["username"] == "newuser"
        assert "password" not in data  # Password should not be returned

    def test_register_duplicate_email(self, client: TestClient, db_session: Session):
        """Test registration with duplicate email."""
        # Create user
        user = User(
            email="duplicate@example.com",
            username="originaluser",
            password="password123"
        )
        db_session.add(user)
        db_session.commit()

        # Try to register with same email
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "duplicate@example.com",
                "username": "newusername",
                "password": "password456"
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "email already registered" in data["detail"].lower()

    def test_register_duplicate_username(self, client: TestClient, db_session: Session):
        """Test registration with duplicate username."""
        # Create user
        user = User(
            email="original@example.com",
            username="duplicate",
            password="password123"
        )
        db_session.add(user)
        db_session.commit()

        # Try to register with same username
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "new@example.com",
                "username": "duplicate",
                "password": "password456"
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "username already taken" in data["detail"].lower()

    def test_login_success(self, client: TestClient, db_session: Session):
        """Test successful login."""
        # Create user
        password = "securepassword123"
        user = User(
            email="login@example.com",
            username="loginuser",
            password=password
        )
        db_session.add(user)
        db_session.commit()

        # Login
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "loginuser",
                "password": password
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["email"] == user.email
        assert data["user"]["username"] == user.username

    def test_login_incorrect_password(self, client: TestClient, db_session: Session):
        """Test login with incorrect password."""
        # Create user
        user = User(
            email="wrong@example.com",
            username="wronguser",
            password="correctpassword"
        )
        db_session.add(user)
        db_session.commit()

        # Login with wrong password
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "wronguser",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "incorrect username or password" in data["detail"].lower()

    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with non-existent user."""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "nonexistentuser",
                "password": "anypassword"
            }
        )
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "incorrect username or password" in data["detail"].lower()

    def test_logout(self, client: TestClient, authenticated_user):
        """
        Test user logout.
        """
        # Get token from authenticated user
        token = authenticated_user["token"]
        
        # Make request to logout endpoint
        response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Check response
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Successfully logged out"
        assert "user" in data 