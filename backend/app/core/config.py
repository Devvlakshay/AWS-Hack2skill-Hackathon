from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Data storage (JSON files)
    DATA_DIR: str = "data"

    # JWT
    JWT_SECRET_KEY: str = "change-this-to-a-real-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # App
    APP_NAME: str = "FitView AI"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    BASE_URL: str = "http://localhost:8000"

    # File uploads (local storage for development)
    UPLOAD_DIR: str = "uploads"

    # AI APIs (Phase 3+)
    NANO_BANANA_API_KEY: Optional[str] = None
    GROK_IMAGINE_API_KEY: Optional[str] = None

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


settings = Settings()
