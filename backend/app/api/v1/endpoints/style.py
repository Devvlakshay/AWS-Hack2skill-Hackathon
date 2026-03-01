"""
Style Variation API Endpoints for FitView AI.
Phase 4: Intelligence Layer.

POST /style/generate               - Generate a style variation
GET  /style/variations/{session_id} - Get all variations for a try-on session
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user, get_store
from app.models.style import (
    StyleVariationListResponse,
    StyleVariationRequest,
    StyleVariationResponse,
)
from app.services.style_service import (
    StyleServiceError,
    generate_style_variation,
    get_variations_for_session,
)
from app.utils.json_store import JsonStore

router = APIRouter(prefix="/style", tags=["Style Variations"])


@router.post("/generate", response_model=StyleVariationResponse, status_code=status.HTTP_201_CREATED)
async def create_style_variation(
    request: StyleVariationRequest,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Generate a style variation of a try-on result."""
    try:
        result = await generate_style_variation(
            store=store,
            session_id=request.session_id,
            user_id=current_user["_id"],
            style=request.style,
        )
        return result
    except StyleServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Style variation generation failed: {str(e)}",
        )


@router.get("/variations/{session_id}", response_model=StyleVariationListResponse)
async def list_style_variations(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Get all style variations for a try-on session."""
    try:
        return await get_variations_for_session(
            store=store,
            session_id=session_id,
            user_id=current_user["_id"],
        )
    except StyleServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
