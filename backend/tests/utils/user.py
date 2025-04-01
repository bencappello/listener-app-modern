import random
import string

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.users.user import UserCreate

def random_lower_string(length: int = 32) -> str:
    return "".join(random.choices(string.ascii_lowercase, k=length))

def random_email() -> str:
    return f"{random_lower_string(8)}@{random_lower_string(6)}.com"

def create_random_user(db: Session, *, username: str | None = None, email: str | None = None) -> User:
    """Create a random user for testing."""
    if email is None:
        email = random_email()
    if username is None:
        username = random_lower_string(10)
    password = "testpassword"
    user_in = UserCreate(email=email, username=username, password=password)
    
    # Use direct model creation for tests
    # Be careful if using user_service.create as it checks duplicates
    user_obj = User(**user_in.model_dump())
    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)
    return user_obj 