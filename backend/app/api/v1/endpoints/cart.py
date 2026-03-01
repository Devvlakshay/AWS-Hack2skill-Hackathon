"""
Cart API Endpoints for FitView AI.
Phase 4: Intelligence Layer.

GET    /cart             - Get user's cart
POST   /cart/items       - Add item to cart
PUT    /cart/items/{id}  - Update cart item
DELETE /cart/items/{id}  - Remove item from cart
DELETE /cart             - Clear cart
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user, get_store
from app.models.cart import CartItemRequest, CartItemUpdate, CartResponse
from app.services.cart_service import (
    CartServiceError,
    add_to_cart,
    clear_cart,
    get_cart,
    remove_from_cart,
    update_cart_item,
)
from app.utils.json_store import JsonStore

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", response_model=CartResponse)
async def get_user_cart(
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Get the current user's shopping cart."""
    return await get_cart(store, current_user["_id"])


@router.post("/items", response_model=CartResponse, status_code=status.HTTP_201_CREATED)
async def add_cart_item(
    request: CartItemRequest,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Add an item to the cart."""
    try:
        return await add_to_cart(
            store=store,
            user_id=current_user["_id"],
            product_id=request.product_id,
            size=request.size,
            quantity=request.quantity,
        )
    except CartServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/items/{product_id}", response_model=CartResponse)
async def update_item(
    product_id: str,
    request: CartItemUpdate,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Update a cart item's size or quantity."""
    try:
        return await update_cart_item(
            store=store,
            user_id=current_user["_id"],
            product_id=product_id,
            size=request.size,
            quantity=request.quantity,
        )
    except CartServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete("/items/{product_id}", response_model=CartResponse)
async def remove_item(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Remove an item from the cart."""
    try:
        return await remove_from_cart(
            store=store,
            user_id=current_user["_id"],
            product_id=product_id,
        )
    except CartServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.delete("", response_model=CartResponse)
async def clear_user_cart(
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Clear all items from the cart."""
    return await clear_cart(store, current_user["_id"])
