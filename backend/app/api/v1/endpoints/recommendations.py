"""
Recommendations API Endpoints for FitView AI.
Phase 4: Intelligence Layer.

GET /recommendations/size?product_id=xxx - Size recommendation
GET /recommendations/style?limit=10      - Style recommendations
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_user, get_store
from app.models.recommendation import SizeRecommendation, StyleRecommendation
from app.services.recommendation_service import recommend_size, recommend_style
from app.utils.json_store import JsonStore

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("/size", response_model=SizeRecommendation)
async def get_size_recommendation(
    product_id: str = Query(..., description="Product ID to get size recommendation for"),
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Get a size recommendation for a specific product."""
    try:
        return await recommend_size(
            store=store,
            user_id=current_user["_id"],
            product_id=product_id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate size recommendation: {str(e)}",
        )


@router.get("/style", response_model=StyleRecommendation)
async def get_style_recommendations(
    limit: int = Query(10, ge=1, le=50, description="Number of recommendations"),
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Get style/product recommendations based on user's try-on history."""
    try:
        return await recommend_style(
            store=store,
            user_id=current_user["_id"],
            limit=limit,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate style recommendations: {str(e)}",
        )
