from typing import Dict

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
# We will need User model and potentially schemas later
from app.models.user import User
# from app.schemas.user import UserCreate

# Test user data
test_user_data: Dict[str, str] = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "verystrongpassword",
}

# --- Registration Tests ---

def test_create_user_success(client: TestClient, db: Session) -> None:
    """
    Test successful user registration.
    """
    response = client.post(
        f"{settings.API_V1_STR}/auth/register",
        json=test_user_data,
    )
    assert response.status_code == 201  # Created
    created_user = response.json()
    assert created_user["email"] == test_user_data["email"]
    assert created_user["username"] == test_user_data["username"]
    assert "id" in created_user
    assert "password" not in created_user  # Ensure password is not returned

    # TODO: Verify user exists in DB (requires User model import)
    # user_in_db = db.query(User).filter(User.email == test_user_data["email"]).first()
    # assert user_in_db
    # assert user_in_db.username == test_user_data["username"]

def test_create_user_existing_username(client: TestClient, db: Session) -> None:
    """
    Test registration attempt with an already existing username.
    """
    # Create the first user
    client.post(
        f"{settings.API_V1_STR}/auth/register",
        json=test_user_data,
    )
    # Attempt to create another user with the same username but different email
    duplicate_username_data: Dict[str, str] = {
        "username": test_user_data["username"],
        "email": "another@example.com",
        "password": "anotherpassword",
    }
    response = client.post(
        f"{settings.API_V1_STR}/auth/register",
        json=duplicate_username_data,
    )
    assert response.status_code == 400  # Bad Request
    error_detail = response.json()
    assert "detail" in error_detail
    assert "Username already taken" in error_detail["detail"] # Corrected assertion

def test_create_user_existing_email(client: TestClient, db: Session) -> None:
    """
    Test registration attempt with an already existing email.
    """
     # Create the first user
    client.post(
        f"{settings.API_V1_STR}/auth/register",
        json=test_user_data,
    )
    # Attempt to create another user with the same email but different username
    duplicate_email_data: Dict[str, str] = {
        "username": "anotheruser",
        "email": test_user_data["email"],
        "password": "anotherpassword",
    }
    response = client.post(
        f"{settings.API_V1_STR}/auth/register",
        json=duplicate_email_data,
    )
    assert response.status_code == 400 # Bad Request
    error_detail = response.json()
    assert "detail" in error_detail
    assert "Email already registered" in error_detail["detail"] # Or similar message

@pytest.mark.parametrize(
    "invalid_data, expected_status, expected_substring",
    [
        ({"username": "test", "email": "test@example.com", "password": "short"}, 422, "string should have at least 8 characters"), # Short password - Updated expected msg
        ({"username": "test", "email": "invalid-email", "password": "validpassword"}, 422, "value is not a valid email address"), # Invalid email
        ({"username": "test", "password": "validpassword"}, 422, "field required"), # Missing email
        ({"email": "test@example.com", "password": "validpassword"}, 422, "field required"), # Missing username
        ({"username": "test", "email": "test@example.com"}, 422, "field required"), # Missing password
    ]
)
def test_create_user_invalid_data(
    client: TestClient, db: Session, invalid_data: Dict[str, str], expected_status: int, expected_substring: str
) -> None:
    """
    Test registration with various invalid input data using Pydantic validation.
    """
    response = client.post(
        f"{settings.API_V1_STR}/auth/register",
        json=invalid_data,
    )
    print(f"Validation Response ({response.status_code}): {response.json()}")
    assert response.status_code == expected_status # Unprocessable Entity
    error_detail = response.json()
    assert "detail" in error_detail
    # Pydantic validation errors are usually in a list under 'detail'
    assert isinstance(error_detail["detail"], list)
    # Check only the 'msg' field in the detail list items
    assert any(isinstance(err, dict) and 
               expected_substring in err.get("msg", "").lower() 
               for err in error_detail["detail"])


# --- Login Tests ---

def test_login_success(client: TestClient, db: Session) -> None:
    """
    Test successful user login.
    """
    # 1. Create user first
    client.post(
        f"{settings.API_V1_STR}/auth/register", json=test_user_data
    )

    # 2. Attempt login
    # Send username, not email, for login as per OAuth2PasswordRequestForm expectation
    login_data = {"username": test_user_data["username"], "password": test_user_data["password"]}
    response = client.post(
        f"{settings.API_V1_STR}/auth/login", data=login_data # Login often uses form data
    )
    assert response.status_code == 200 # OK
    token_data = response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

def test_login_incorrect_email(client: TestClient, db: Session) -> None:
    """
    Test login attempt with a non-existent email.
    """
     # 1. Create user first
    client.post(
        f"{settings.API_V1_STR}/auth/register", json=test_user_data
    )
    # 2. Attempt login with wrong email
    login_data = {"username": "wrong@example.com", "password": test_user_data["password"]}
    response = client.post(
        f"{settings.API_V1_STR}/auth/login", data=login_data
    )
    assert response.status_code == 401 # Unauthorized
    error_detail = response.json()
    assert "detail" in error_detail
    assert "Incorrect email or password" in error_detail["detail"]

def test_login_incorrect_password(client: TestClient, db: Session) -> None:
    """
    Test login attempt with the correct email but incorrect password.
    """
     # 1. Create user first
    client.post(
        f"{settings.API_V1_STR}/auth/register", json=test_user_data
    )
    # 2. Attempt login with wrong password
    login_data = {"username": test_user_data["email"], "password": "wrongpassword"}
    response = client.post(
        f"{settings.API_V1_STR}/auth/login", data=login_data
    )
    assert response.status_code == 401 # Unauthorized
    error_detail = response.json()
    assert "detail" in error_detail
    assert "Incorrect email or password" in error_detail["detail"]

# TODO: Add tests for token validation, password recovery (if applicable), etc. 

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
        assert "Username already taken" in data["detail"] # Corrected assertion

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
        assert "incorrect email or password" in data["detail"].lower()

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
        assert "incorrect email or password" in data["detail"].lower()

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