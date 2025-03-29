from fastapi import APIRouter

from app.api.v1.auth.endpoints import router as auth_router
from app.api.v1.users.endpoints import router as users_router

# Create API router
api_router = APIRouter()

# Add all routers
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"]) 