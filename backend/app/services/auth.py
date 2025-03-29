from datetime import datetime, timedelta
from typing import Optional, Union, Dict, Any, Set

from jose import jwt, JWTError
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.models.user import User

# In-memory token blacklist
# In a production app, this would be in Redis or another distributed store
token_blacklist: Set[str] = set()


def create_access_token(
    data: Dict[str, Any], 
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create JWT access token.
    
    Args:
        data: Data to encode in token
        expires_delta: Optional expiration delta
        
    Returns:
        str: Encoded JWT
    """
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION)
    
    to_encode.update({"exp": expire})
    
    # Create encoded JWT
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_SECRET, 
        algorithm=settings.JWT_ALGORITHM
    )
    
    return encoded_jwt


def verify_token(token: str, db: Session) -> Optional[User]:
    """
    Verify JWT token and return user.
    
    Args:
        token: JWT token to verify
        db: Database session
        
    Returns:
        Optional[User]: User if token is valid, None otherwise
    """
    try:
        # Check if token is blacklisted
        if token in token_blacklist:
            return None
        
        # Decode JWT
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        # Extract email from token
        email: str = payload.get("sub")
        if email is None:
            return None
            
        # Get user from database
        user = db.query(User).filter(User.email == email).first()
        return user
    except JWTError:
        # Return None if token is invalid
        raise


async def verify_token_async(token: str, db: AsyncSession) -> Optional[User]:
    """
    Verify JWT token and return user (async version).
    
    Args:
        token: JWT token to verify
        db: Async database session
        
    Returns:
        Optional[User]: User if token is valid, None otherwise
    """
    try:
        # Check if token is blacklisted
        if token in token_blacklist:
            return None
        
        # Decode JWT
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        # Extract email from token
        email: str = payload.get("sub")
        if email is None:
            return None
            
        # Get user from database using async query
        result = await db.execute(select(User).filter(User.email == email))
        user = result.scalars().first()
        return user
    except JWTError:
        # Return None if token is invalid
        raise


def blacklist_token(token: str) -> None:
    """
    Add a token to the blacklist.
    
    Args:
        token: JWT token to blacklist
    """
    token_blacklist.add(token) 