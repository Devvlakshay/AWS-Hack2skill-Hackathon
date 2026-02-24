from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core import deps
from app.api.v1.router import api_router
from app.utils.json_store import JsonStore
import os

# Ensure upload directory exists before StaticFiles mount
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize JSON store
    deps.store = JsonStore(data_dir=settings.DATA_DIR)
    deps.store.load()
    print(f"JSON store loaded from {settings.DATA_DIR}/")

    yield

    # Shutdown: nothing to close
    print("Server shutting down")


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
