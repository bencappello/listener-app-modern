import os
import secrets
from typing import Any, Dict, List, Optional, Union

from pydantic import validator, BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable loading."""
    
    # App
    APP_ENV: str = "development"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    SECRET_KEY: str = "development_secret_key"
    DEBUG: bool = True
    
    # CORS - simplified to avoid validation errors
    API_CORS_ORIGINS_STR: Optional[str] = None
    
    @property
    def API_CORS_ORIGINS(self) -> List[str]:
        """Get a list of allowed CORS origins."""
        if self.API_CORS_ORIGINS_STR:
            return [i.strip() for i in self.API_CORS_ORIGINS_STR.split(",")]
        return ["http://localhost:3000", "http://localhost:8080"]
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/listener_db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    
    # JWT
    JWT_SECRET: str = "jwt_development_secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION: int = 1440  # 24 hours in minutes
    
    @validator("JWT_EXPIRATION", pre=True)
    def parse_jwt_expiration(cls, v):
        """Parse JWT expiration from string to int."""
        if isinstance(v, str):
            # Remove any comments and convert to int
            v = v.split('#')[0].strip()
            return int(v)
        return v
    
    # AWS
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: Optional[str] = None
    AWS_S3_BUCKET: Optional[str] = None
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()

# Override settings for test environment
if os.environ.get("APP_ENV") == "test":
    settings.DEBUG = True
    settings.DATABASE_URL = "sqlite:///./test.db"
    settings.REDIS_URL = "redis://localhost:6379/1" 