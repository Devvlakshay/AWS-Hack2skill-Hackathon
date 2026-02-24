from fastapi import APIRouter

from app.api.v1.endpoints import auth, products, models

api_router = APIRouter()

# Phase 1: Authentication
api_router.include_router(auth.router)

# Phase 2: Products & Models
api_router.include_router(products.router)
api_router.include_router(models.router)
