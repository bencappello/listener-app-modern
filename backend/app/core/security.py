from passlib.context import CryptContext

# Use bcrypt for hashing passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.

    Args:
        plain_password (str): The password provided by the user.
        hashed_password (str): The password hash stored in the database.

    Returns:
        bool: True if the password matches, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Hash a plain password.

    Args:
        password (str): The plain password to hash.

    Returns:
        str: The hashed password.
    """
    return pwd_context.hash(password)

# TODO: Add JWT token creation and decoding functions later in Step 7 