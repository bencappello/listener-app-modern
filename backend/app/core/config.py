import os
import secrets
from typing import Any, Dict, List, Optional, Union

from pydantic import validator, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable loading."""
    
    # App
    APP_ENV: str = "development"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_V1_STR: str = "/api/v1"  # Added API version prefix
    DEBUG: bool = True
    
    # CORS
    API_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"] # Define field with default
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/listener_db"
    DB_HOST: str = "postgres"
    DB_PORT: str = "5432"
    DB_NAME: str = "listener_db"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    
    # JWT
    SECRET_KEY: str = "jwt_development_secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours in minutes
    JWT_SECRET: str = "your_jwt_secret_here"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION: int = 1440
    
    @field_validator("ACCESS_TOKEN_EXPIRE_MINUTES", "JWT_EXPIRATION", mode='before')
    @classmethod
    def parse_jwt_expiration(cls, v: Any) -> int:
        """Parse JWT expiration from string to int."""
        if isinstance(v, str):
            v = v.split('#')[0].strip()
            try:
                return int(v)
            except ValueError:
                raise ValueError("Invalid integer value for JWT expiration")
        elif isinstance(v, int):
             return v
        raise TypeError("JWT expiration must be an int or string")
    
    # AWS
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: Optional[str] = None
    AWS_S3_BUCKET: Optional[str] = None
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"
    REACT_APP_API_URL: str = "http://localhost:8000"
    
    # Use model_config instead of Config class for Pydantic v2 settings
    model_config = SettingsConfigDict(
        env_file='.env',
        case_sensitive=True,
        extra='ignore' # Keep ignore
    )


# Create settings instance
settings = Settings()

# Override settings for test environment
if os.environ.get("APP_ENV") == "test":
    settings.DEBUG = True
    settings.DATABASE_URL = "sqlite:///./test.db"
    settings.REDIS_URL = "redis://localhost:6379/1" 