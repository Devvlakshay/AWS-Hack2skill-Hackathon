"""Order Service for FitView AI."""

import uuid
from datetime import datetime, timezone
from typing import Any

from app.models.order import OrderCreate, OrderListResponse, OrderResponse
from app.utils.json_store import JsonStore

ORDER_COLLECTION = "orders"


async def create_order(
    store: JsonStore,
    user_id: str,
    user_name: str,
    user_email: str,
    data: OrderCreate,
) -> OrderResponse:
    """Create a new order from cart items."""
    now = datetime.now(timezone.utc)

    # Enrich items with retailer_id from products
    items_dicts = []
    for item in data.items:
        item_dict = item.model_dump()
        # Look up retailer_id from product
        product = await store.find_one("products", {"_id": item.product_id})
        if product:
            item_dict["retailer_id"] = product.get("retailer_id", "")
            if not item_dict["product_name"]:
                item_dict["product_name"] = product.get("name", "")
            if not item_dict["product_price"]:
                item_dict["product_price"] = product.get("price", 0)
            if not item_dict["product_image"]:
                images = product.get("images", [])
                item_dict["product_image"] = images[0] if images else ""
        items_dicts.append(item_dict)

    order_dict: dict[str, Any] = {
        "_id": uuid.uuid4().hex,
        "user_id": user_id,
        "user_name": user_name,
        "user_email": user_email,
        "items": items_dicts,
        "address": data.address,
        "payment_method": data.payment_method,
        "total_price": data.total_price,
        "status": "confirmed",
        "created_at": now.isoformat(),
    }

    await store.insert_one(ORDER_COLLECTION, order_dict)
    return OrderResponse(**order_dict)


async def get_orders_for_retailer(
    store: JsonStore,
    retailer_id: str,
    page: int = 1,
    limit: int = 20,
) -> OrderListResponse:
    """Get orders that contain products from this retailer."""
    all_orders = await store.find_many(ORDER_COLLECTION, {}, sort_field="created_at", sort_order=-1, skip=0, limit=1000)

    # Filter orders that have items belonging to this retailer
    retailer_orders = []
    for order in all_orders:
        retailer_items = [
            item for item in order.get("items", [])
            if item.get("retailer_id") == retailer_id
        ]
        if retailer_items:
            # Create a copy with only this retailer's items
            filtered_order = {**order, "items": retailer_items}
            # Recalculate total for retailer's items only
            filtered_order["total_price"] = sum(
                item.get("product_price", 0) * item.get("quantity", 1)
                for item in retailer_items
            )
            retailer_orders.append(filtered_order)

    total = len(retailer_orders)
    start = (page - 1) * limit
    end = start + limit
    page_orders = retailer_orders[start:end]

    orders = [OrderResponse(**o) for o in page_orders]
    return OrderListResponse(orders=orders, total=total, page=page, limit=limit)


async def get_orders_for_user(
    store: JsonStore,
    user_id: str,
    page: int = 1,
    limit: int = 20,
) -> OrderListResponse:
    """Get orders for a specific user."""
    query = {"user_id": user_id}
    total = await store.count(ORDER_COLLECTION, query)

    skip = (page - 1) * limit
    orders_data = await store.find_many(
        ORDER_COLLECTION, query,
        sort_field="created_at", sort_order=-1,
        skip=skip, limit=limit,
    )

    orders = [OrderResponse(**o) for o in orders_data]
    return OrderListResponse(orders=orders, total=total, page=page, limit=limit)
