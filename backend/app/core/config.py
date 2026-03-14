from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):
    # Data storage (JSON files)
    DATA_DIR: str = "data"

    # JWT
    JWT_SECRET_KEY: str = Field(description="Required. Generate with: python -c \"import secrets; print(secrets.token_urlsafe(32))\"")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # App
    APP_NAME: str = "FitView AI"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"
    BASE_URL: str = "http://localhost:8000"

    # File uploads (local storage for development)
    UPLOAD_DIR: str = "uploads"

    # AI APIs (Phase 3+)
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_IMAGE_MODEL: str = "gemini-3-pro-image-preview"

    # Vertex AI (disabled — using direct Gemini API key from .env)
    VERTEX_AI_PROJECT_ID: str = ""
    VERTEX_AI_LOCATION: str = "us-central1"
    VERTEX_AI_SERVICE_ACCOUNT_JSON: str = ""
    USE_VERTEX_AI: bool = False

    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "fitview_dev"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # AWS
    AWS_REGION: str = "ap-south-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = ""
    CLOUDFRONT_URL: str = ""

    # Security
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    ALLOWED_HOSTS: str = "localhost,127.0.0.1"

    # Login with Amazon (OAuth)
    LWA_CLIENT_ID: str = ""
    LWA_CLIENT_SECRET: str = ""

    # Bedrock
    BEDROCK_REGION: str = "us-east-1"
    BEDROCK_MODEL_ID: str = "us.anthropic.claude-3-haiku-20240307-v1:0"
    BEDROCK_CHAT_MODEL_ID: str = "qwen.qwen3-32b-v1:0"
    USE_BEDROCK: bool = True

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


settings = Settings()
