from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core import deps
from app.core.db import connect_db, close_db
from app.core.cache import connect_redis, close_redis
from app.api.v1.router import api_router
from app.utils.json_store import JsonStore
import os

# Ensure upload directory exists before StaticFiles mount
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Rate limiter (keyed by remote IP address)
limiter = Limiter(key_func=get_remote_address)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if not settings.DEBUG:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize JSON store
    deps.store = JsonStore(data_dir=settings.DATA_DIR)
    deps.store.load()
    print(f"JSON store loaded from {settings.DATA_DIR}/")

    # Startup: connect MongoDB
    try:
        await connect_db()
        print("MongoDB connected")
    except Exception as e:
        print(f"MongoDB connection failed (continuing without it): {e}")

    # Startup: connect Redis
    try:
        await connect_redis()
        print("Redis connected")
    except Exception as e:
        print(f"Redis connection failed (continuing without it): {e}")

    yield

    # Shutdown: disconnect MongoDB and Redis
    await close_db()
    await close_redis()
    print("Server shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered virtual try-on platform for Indian retail clothing",
    version="1.0.0",
    lifespan=lifespan,
)

# Attach rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# CORS middleware — use configured ALLOWED_ORIGINS
_allowed_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
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
    from app.core.db import get_db
    from app.core.cache import get_redis

    db_status = "unavailable"
    redis_status = "unavailable"

    try:
        db = get_db()
        if db is not None:
            await db.command("ping")
            db_status = "healthy"
    except Exception:
        db_status = "unavailable"

    try:
        redis = get_redis()
        if redis is not None:
            await redis.ping()
            redis_status = "healthy"
    except Exception:
        redis_status = "unavailable"

    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "mongodb": db_status,
        "redis": redis_status,
    }
