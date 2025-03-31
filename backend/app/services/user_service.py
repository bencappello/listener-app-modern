from typing import Optional

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.users.user import UserCreate
from app.core.security import get_password_hash

class UserService:
    """Service layer for user operations."""

    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        """Get a user by email."""
        return db.query(User).filter(User.email == email).first()

    def get_by_username(self, db: Session, *, username: str) -> Optional[User]:
        """Get a user by username."""
        return db.query(User).filter(User.username == username).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        """
        Create a new user.
        
        Checks for duplicate username or email before creation.
        Hashes the password.
        """
        if self.get_by_username(db, username=obj_in.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )
        if self.get_by_email(db, email=obj_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
            
        # Hash the password using the security utility
        # hashed_password = get_password_hash(obj_in.password)
        
        # The User model's __init__ method handles hashing internally
        db_obj = User(
            email=obj_in.email,
            username=obj_in.username,
            password=obj_in.password, # Pass the plain password
            # hashed_password=hashed_password, # Remove this line
            # Set defaults for other fields if needed (e.g., is_active=True)
            is_active=True 
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

# Instantiate the service
user_service = UserService() 