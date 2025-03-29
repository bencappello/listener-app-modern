from fastapi import APIRouter

from app.api.v1.auth.endpoints import router as auth_router

# Create API router
api_router = APIRouter()

# Add all routers
api_router.include_router(auth_router, prefix="/auth", tags=["auth"]) 