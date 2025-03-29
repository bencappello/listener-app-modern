from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

# Create FastAPI application
app = FastAPI(
    title="Listener API",
    description="Music blog aggregator API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.API_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint.
    
    Returns:
        dict: Health status
    """
    return {"status": "ok", "version": app.version}


# Import and include routers
# These will be uncommented as we implement the routes in subsequent steps
# from app.api.routes import auth, users, songs, bands, blogs, tags, comments
# app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
# app.include_router(users.router, prefix="/api/users", tags=["Users"])
# app.include_router(songs.router, prefix="/api/songs", tags=["Songs"])
# app.include_router(bands.router, prefix="/api/bands", tags=["Bands"])
# app.include_router(blogs.router, prefix="/api/blogs", tags=["Blogs"])
# app.include_router(tags.router, prefix="/api/tags", tags=["Tags"])
# app.include_router(comments.router, prefix="/api/comments", tags=["Comments"])


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG,
    ) 