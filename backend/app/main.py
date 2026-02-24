from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
import redis.asyncio as aioredis

from app.core.config import settings
from app.core import deps
from app.api.v1.router import api_router
from app.services.auth_service import create_indexes as create_auth_indexes
from app.services.product_service import ensure_indexes as create_product_indexes
from app.services.model_service import ensure_indexes as create_model_indexes


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect to MongoDB and Redis
    deps.mongo_client = AsyncIOMotorClient(settings.MONGODB_URL)
    try:
        deps.redis_client = aioredis.from_url(
            settings.REDIS_URL, decode_responses=True
        )
        await deps.redis_client.ping()
        print("Redis connected successfully")
    except Exception as e:
        print(f"Redis connection failed (non-critical): {e}")
        deps.redis_client = None

    # Create MongoDB indexes
    db = deps.mongo_client[settings.DATABASE_NAME]
    await create_auth_indexes(db)
    await create_product_indexes(db)
    await create_model_indexes(db)
    print("MongoDB connected and indexes created")

    # Ensure upload directory exists
    import os
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    yield

    # Shutdown: close connections
    if deps.mongo_client:
        deps.mongo_client.close()
    if deps.redis_client:
        await deps.redis_client.close()
    print("Connections closed")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered virtual try-on platform for Indian retail clothing",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware — allow frontend origin for development
# Note: allow_origins=["*"] with allow_credentials=True is invalid per CORS spec.
# Use explicit origins when credentials are enabled.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files statically
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": "1.0.0",
    }
