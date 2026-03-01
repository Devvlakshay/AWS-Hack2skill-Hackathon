from fastapi import APIRouter

from app.api.v1.endpoints import auth, products, models, tryon

api_router = APIRouter()

# Phase 1: Authentication
api_router.include_router(auth.router)

# Phase 2: Products & Models
api_router.include_router(products.router)
api_router.include_router(models.router)

# Phase 3: Virtual Try-On
api_router.include_router(tryon.router)
