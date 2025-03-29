import pytest
from datetime import datetime, timedelta
from jose import jwt, JWTError

from app.core.config import settings
from app.services.auth import create_access_token, verify_token
from app.models.user import User


class TestAuthService:
    """Test suite for authentication service."""

    def test_create_access_token(self):
        """Test creating a JWT token."""
        user_data = {"sub": "test@example.com", "username": "testuser"}
        token = create_access_token(data=user_data)
        
        assert token is not None
        assert isinstance(token, str)
        
        # Verify token is valid JWT
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        assert payload["sub"] == user_data["sub"]
        assert payload["username"] == user_data["username"]
        assert "exp" in payload
    
    def test_token_expiration(self):
        """Test that token expiration works correctly."""
        user_data = {"sub": "test@example.com"}
        
        # Create token with very short expiry
        token = create_access_token(
            data=user_data, 
            expires_delta=timedelta(seconds=1)
        )
        
        # Wait for token to expire
        import time
        time.sleep(2)
        
        # Verify token is expired
        with pytest.raises(JWTError):
            jwt.decode(
                token, 
                settings.JWT_SECRET, 
                algorithms=[settings.JWT_ALGORITHM]
            )
    
    def test_verify_token_valid(self, db_session):
        """Test token verification with valid token."""
        # Create a test user
        user = User(
            email="token@example.com",
            username="tokenuser",
            password="password123"
        )
        db_session.add(user)
        db_session.commit()
        
        # Create a token for the user
        token = create_access_token(
            data={"sub": user.email, "username": user.username}
        )
        
        # Verify the token
        verified_user = verify_token(token, db_session)
        
        assert verified_user is not None
        assert verified_user.id == user.id
        assert verified_user.email == user.email
    
    def test_verify_token_invalid(self, db_session):
        """Test token verification with invalid token."""
        # Create an invalid token
        invalid_token = "invalid.token.string"
        
        # Verify the token
        with pytest.raises(JWTError):
            verify_token(invalid_token, db_session)
    
    def test_verify_token_user_not_found(self, db_session):
        """Test token verification with non-existent user."""
        # Create a token for a non-existent user
        token = create_access_token(
            data={"sub": "nonexistent@example.com", "username": "nonexistent"}
        )
        
        # Verify the token
        verified_user = verify_token(token, db_session)
        
        assert verified_user is None 