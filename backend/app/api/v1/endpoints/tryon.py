"""
Try-On API Endpoints for FitView AI.
Phase 3: Core Virtual Try-On Engine.

POST /tryon           - Generate a virtual try-on image
GET  /tryon/history   - Get user's try-on history
GET  /tryon/{id}      - Get a specific try-on session
PATCH /tryon/{id}/favorite - Toggle favorite on a try-on session
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_user, get_store
from app.models.tryon import (
    TryOnFavoriteRequest,
    TryOnHistoryResponse,
    TryOnRequest,
    TryOnResponse,
)
from app.services.tryon_service import (
    TryOnError,
    generate_tryon,
    get_tryon_by_id,
    get_tryon_history,
    toggle_favorite,
)
from app.utils.json_store import JsonStore

router = APIRouter(prefix="/tryon", tags=["Try-On"])


@router.post("", response_model=TryOnResponse, status_code=status.HTTP_201_CREATED)
async def create_tryon(
    request: TryOnRequest,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """
    Generate a virtual try-on image.
    Customer selects a model and a product, AI generates the try-on result.
    """
    try:
        result = await generate_tryon(
            store=store,
            model_id=request.model_id,
            product_id=request.product_id,
            user_id=current_user["id"],
        )
        return result
    except TryOnError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Try-on generation failed: {str(e)}",
        )


@router.get("/history", response_model=TryOnHistoryResponse)
async def list_tryon_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Get the current user's try-on history with pagination."""
    return await get_tryon_history(
        store=store,
        user_id=current_user["id"],
        page=page,
        limit=limit,
    )


@router.get("/{session_id}", response_model=TryOnResponse)
async def get_tryon_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Get a specific try-on session by ID."""
    result = await get_tryon_by_id(
        store=store,
        session_id=session_id,
        user_id=current_user["id"],
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Try-on session not found",
        )
    return result


@router.patch("/{session_id}/favorite", response_model=TryOnResponse)
async def toggle_tryon_favorite(
    session_id: str,
    request: TryOnFavoriteRequest,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Toggle favorite status on a try-on session."""
    result = await toggle_favorite(
        store=store,
        session_id=session_id,
        user_id=current_user["id"],
        is_favorite=request.is_favorite,
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Try-on session not found",
        )
    return result
