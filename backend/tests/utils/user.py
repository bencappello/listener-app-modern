import random
import string
from typing import Any

from sqlalchemy.orm import Session

from app.models import User as UserModel
from app.schemas.users.user import UserCreate as UserCreateSchema

def random_lower_string(length: int = 32) -> str:
    return "".join(random.choices(string.ascii_lowercase, k=length))

def random_email() -> str:
    return f"{random_lower_string(8)}@{random_lower_string(6)}.com"

def create_random_user(db_session: Session, *, email: str | None = None) -> UserModel:
    """Create a random user for testing, ensuring only valid fields are passed to the DB model."""
    if email is None:
        email = random_email()
    
    password: str = random_lower_string()
    username: str = random_lower_string(10)
    first_name: str = random_lower_string(5)
    last_name: str = random_lower_string(5)

    # Manually construct the dictionary for the SQLAlchemy User model
    # Only include fields that exist in the User model definition
    user_data_for_db: dict[str, Any] = {
        "email": email,
        "password": password, # Pass plain password, model __init__ will hash it
        "username": username,
        # Remove fields not present in the User model
        # "first_name": first_name, 
        # "last_name": last_name,
        "is_active": True, 
        "is_superuser": False
    }

    user_obj = UserModel(**user_data_for_db)
    db_session.add(user_obj)
    db_session.commit()
    db_session.refresh(user_obj)
    return user_obj 