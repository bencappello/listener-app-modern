from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status, Form, Security
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.encoders import jsonable_encoder
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db, get_async_db
from app.models.user import User
from app.schemas.auth import Token, LogoutResponse
from app.schemas.users.user import UserCreate, User as UserSchema
from app.services.auth import create_access_token, verify_token, blacklist_token, verify_token_async
from app.services.user_service import user_service
from app.core.security import verify_password

router = APIRouter()

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
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
    user = verify_token(token, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def get_current_user_async(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_async_db)
) -> User:
    """
    Get current authenticated user (async version).
    
    Args:
        token: JWT token
        db: Async Database session
        
    Returns:
        User: Current user
        
    Raises:
        HTTPException: If authentication fails
    """
    user = await verify_token_async(token, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate, 
    db: Session = Depends(get_db)
) -> Any:
    """
    Register a new user using UserService.
    """
    # Use the user service to handle creation, duplicate checks, and password hashing
    # Exceptions (e.g., for duplicates) raised by the service will be handled by FastAPI
    user = user_service.create(db=db, obj_in=user_data)
    # Return the created user (response_model handles filtering)
    return user


@router.post("/register/async", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def register_async(
    user_data: UserCreate, 
    db: AsyncSession = Depends(get_async_db) # Keep async for now, but service is sync
) -> Any:
    """
    Register a new user (async endpoint using sync service for now).
    NOTE: This uses the synchronous user_service. Ideally, an async service would be used.
    """
    # For simplicity now, we call the sync service. 
    # A proper async implementation would require an async user service.
    # Consider potential blocking issues if user creation is slow.
    
    # Check duplicates first (using sync service calls within async context - potential issue)
    # This pattern is generally discouraged, better to have full async path or run sync in threadpool
    temp_sync_db = next(get_db()) # Hacky way to get sync session for checks
    if user_service.get_by_username(temp_sync_db, username=user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    if user_service.get_by_email(temp_sync_db, email=user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    temp_sync_db.close()
    
    # Create user using sync service (again, potentially blocking)
    try:
        # Need another sync session for the actual creation commit
        with Session(next(get_db()).bind) as creation_db:
            user = user_service.create(db=creation_db, obj_in=user_data)
            # Return the created user (response_model handles filtering)
            return user
    except HTTPException as http_exc: # Re-raise HTTP exceptions from service
        raise http_exc
    except Exception as e:
        # Log the error properly in a real app
        print(f"Error during async registration wrapping sync service: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration."
        )


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Any:
    """
    Login user.
    
    Checks password using the verify_password utility.
    """
    user = user_service.get_by_username(db, username=form_data.username)
    
    # Use verify_password from security utils
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password", # Changed from 'username'
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    token_data = {"sub": user.email, "username": user.username}
    access_token = create_access_token(data=token_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserSchema.parse_obj(jsonable_encoder(user))
    }


@router.post("/login/async", response_model=Token)
async def login_async(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    Login user (async version).
    
    Args:
        form_data: Login form data
        db: Async database session
        
    Returns:
        Token: Access token
        
    Raises:
        HTTPException: If login fails
    """
    from sqlalchemy import select
    
    # Find user by username
    result = await db.execute(select(User).filter(User.username == form_data.username))
    user = result.scalars().first()
    
    # Check if user exists and password is correct
    if not user or not user.check_password(form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    token_data = {"sub": user.email, "username": user.username}
    access_token = create_access_token(data=token_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserSchema.parse_obj(jsonable_encoder(user))
    }


@router.api_route("/logout", response_model=LogoutResponse, methods=["GET", "POST"])
async def logout(
    token: str = Security(oauth2_scheme),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Logout user.
    
    Args:
        token: JWT token to invalidate
        current_user: Current authenticated user
        
    Returns:
        LogoutResponse: Logout response
    """
    # Invalidate the token by adding it to the blacklist
    blacklist_token(token)
    return {"message": "Successfully logged out", "user": UserSchema.parse_obj(jsonable_encoder(current_user))}


@router.api_route("/logout/async", response_model=LogoutResponse, methods=["GET", "POST"])
async def logout_async(
    token: str = Security(oauth2_scheme),
    current_user: User = Depends(get_current_user_async)
) -> Any:
    """
    Logout user (async version).
    
    Args:
        token: JWT token to invalidate
        current_user: Current authenticated user
        
    Returns:
        LogoutResponse: Logout response
    """
    # Invalidate the token by adding it to the blacklist
    blacklist_token(token)
    return {"message": "Successfully logged out", "user": UserSchema.parse_obj(jsonable_encoder(current_user))} 