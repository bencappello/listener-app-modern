from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db, get_async_db
from app.models.user import User
from app.services.auth import verify_token, verify_token_async

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user.
    
    Args:
        token: JWT token
        db: Database session
        
    Returns:
        User: Current user
        
    Raises:
        HTTPException: If authentication fails
    """
    try:
        user = verify_token(token, db)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_async(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_async_db)
) -> User:
    """
    Get current authenticated user (async version).
    
    Args:
        token: JWT token
        db: Async database session
        
    Returns:
        User: Current user
        
    Raises:
        HTTPException: If authentication fails
    """
    # For async, we're using the async version of verify_token
    try:
        user = await verify_token_async(token, db)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get current active user.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: Current active user
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    return current_user


async def get_current_active_user_async(
    current_user: User = Depends(get_current_user_async),
) -> User:
    """
    Get current active user (async version).
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: Current active user
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    return current_user


def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get current active superuser.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: Current active superuser
        
    Raises:
        HTTPException: If user is not a superuser
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    # Note: We need to check if the is_superuser attribute exists
    if not hasattr(current_user, "is_superuser") or not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user


async def get_current_active_superuser_async(
    current_user: User = Depends(get_current_user_async),
) -> User:
    """
    Get current active superuser (async version).
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: Current active superuser
        
    Raises:
        HTTPException: If user is not a superuser
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    # Note: We need to check if the is_superuser attribute exists
    if not hasattr(current_user, "is_superuser") or not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user 