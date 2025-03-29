from fastapi import APIRouter

from app.api.v1.auth.endpoints import router as auth_router
from app.api.v1.users.endpoints import router as users_router
from app.api.v1.bands.endpoints import router as bands_router
from app.api.v1.blogs.blogs import router as blogs_router
from app.api.v1.tags.tags import router as tags_router
from app.api.v1.comments.comments import router as comments_router

# Create API router
api_router = APIRouter()

# Add all routers
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(bands_router, prefix="/bands", tags=["bands"])
api_router.include_router(blogs_router, prefix="/blogs", tags=["blogs"])
api_router.include_router(tags_router, prefix="/tags", tags=["tags"])
api_router.include_router(comments_router, prefix="/comments", tags=["comments"]) 