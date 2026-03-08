"""
Order API Endpoints for FitView AI.

POST   /orders           - Place an order
GET    /orders            - Get user's order history
GET    /orders/retailer   - Get orders for retailer's products
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_user, get_store
from app.models.order import OrderCreate, OrderListResponse, OrderResponse
from app.services.order_service import (
    create_order,
    get_orders_for_retailer,
    get_orders_for_user,
)
from app.utils.json_store import JsonStore

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def place_order(
    data: OrderCreate,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Place a new order."""
    return await create_order(
        store=store,
        user_id=current_user["_id"],
        user_name=current_user.get("name", ""),
        user_email=current_user.get("email", ""),
        data=data,
    )


@router.get("", response_model=OrderListResponse)
async def list_user_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Get current user's order history."""
    return await get_orders_for_user(
        store=store,
        user_id=current_user["_id"],
        page=page,
        limit=limit,
    )


@router.get("/retailer", response_model=OrderListResponse)
async def list_retailer_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Get orders containing this retailer's products."""
    if current_user.get("role") not in ("retailer", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only retailers can view retailer orders",
        )
    return await get_orders_for_retailer(
        store=store,
        retailer_id=current_user["_id"],
        page=page,
        limit=limit,
    )
