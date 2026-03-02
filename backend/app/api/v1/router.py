from fastapi import APIRouter

from app.api.v1.endpoints import auth, products, models, tryon
from app.api.v1.endpoints import style, recommendations, cart, wishlist
from app.api.v1.endpoints import analytics
from app.api.v1.endpoints import chatbot

api_router = APIRouter()

# Phase 1: Authentication
api_router.include_router(auth.router)

# Phase 2: Products & Models
api_router.include_router(products.router)
api_router.include_router(models.router)

# Phase 3: Virtual Try-On
api_router.include_router(tryon.router)

# Phase 4: Intelligence Layer
api_router.include_router(style.router)
api_router.include_router(recommendations.router)
api_router.include_router(cart.router)
api_router.include_router(wishlist.router)

# Phase 5: Analytics
api_router.include_router(analytics.router)

# Phase 6 (Bedrock): AI Chatbot
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])
