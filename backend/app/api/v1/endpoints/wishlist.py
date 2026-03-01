"""
Wishlist API Endpoints for FitView AI.
Phase 4: Intelligence Layer.

GET    /wishlist              - Get user's wishlist
POST   /wishlist              - Add item to wishlist
DELETE /wishlist/{product_id} - Remove item from wishlist
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user, get_store
from app.models.wishlist import WishlistItemRequest, WishlistResponse
from app.services.wishlist_service import (
    WishlistServiceError,
    add_to_wishlist,
    get_wishlist,
    remove_from_wishlist,
)
from app.utils.json_store import JsonStore

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("", response_model=WishlistResponse)
async def get_user_wishlist(
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Get the current user's wishlist."""
    return await get_wishlist(store, current_user["_id"])


@router.post("", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
async def add_wishlist_item(
    request: WishlistItemRequest,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Add a product to the wishlist."""
    try:
        return await add_to_wishlist(
            store=store,
            user_id=current_user["_id"],
            product_id=request.product_id,
            tryon_image_url=request.tryon_image_url or "",
        )
    except WishlistServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete("/{product_id}", response_model=WishlistResponse)
async def remove_wishlist_item(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Remove a product from the wishlist."""
    try:
        return await remove_from_wishlist(
            store=store,
            user_id=current_user["_id"],
            product_id=product_id,
        )
    except WishlistServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
