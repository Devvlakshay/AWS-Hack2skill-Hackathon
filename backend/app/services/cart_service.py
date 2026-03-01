"""
Cart Service for FitView AI.
Phase 4: Intelligence Layer.

Manages shopping cart operations using the JsonStore.
Cart is stored as a single document per user with an items array.
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from app.models.cart import CartItemResponse, CartResponse
from app.utils.json_store import JsonStore

logger = logging.getLogger(__name__)

CARTS_COLLECTION = "carts"


async def get_cart(store: JsonStore, user_id: str) -> CartResponse:
    """Get the user's cart with enriched product details."""
    cart = await store.find_one(CARTS_COLLECTION, {"user_id": user_id})
    if not cart:
        return CartResponse(items=[], total_items=0, total_price=0)

    items = cart.get("items", [])
    enriched_items: list[CartItemResponse] = []
    total_price = 0.0

    for item in items:
        product = await store.find_one("products", {"_id": item["product_id"], "is_deleted": False})
        product_name = product.get("name", "Unknown Product") if product else "Unknown Product"
        product_price = product.get("price", 0) if product else 0
        product_images = product.get("images", []) if product else []
        product_image = product_images[0] if product_images else ""

        # Check for try-on image
        tryon_image_url = ""
        tryon_session = await store.find_one(
            "tryon_sessions",
            {"user_id": user_id, "product_id": item["product_id"]},
        )
        if tryon_session:
            tryon_image_url = tryon_session.get("result_url", "")

        item_total = product_price * item.get("quantity", 1)
        total_price += item_total

        enriched_items.append(CartItemResponse(
            product_id=item["product_id"],
            size=item.get("size", ""),
            quantity=item.get("quantity", 1),
            added_at=item.get("added_at", ""),
            product_name=product_name,
            product_price=product_price,
            product_image=product_image,
            tryon_image_url=tryon_image_url,
        ))

    return CartResponse(
        items=enriched_items,
        total_items=sum(i.quantity for i in enriched_items),
        total_price=round(total_price, 2),
    )


async def add_to_cart(
    store: JsonStore,
    user_id: str,
    product_id: str,
    size: str,
    quantity: int = 1,
) -> CartResponse:
    """Add an item to the user's cart."""
    # Verify product exists
    product = await store.find_one("products", {"_id": product_id, "is_deleted": False})
    if not product:
        raise CartServiceError("Product not found")

    # Check size availability
    available_sizes = product.get("sizes", [])
    size_found = False
    for s in available_sizes:
        if s.get("size") == size:
            if s.get("stock", 0) < quantity:
                raise CartServiceError(f"Insufficient stock for size {size}")
            size_found = True
            break
    if not size_found and available_sizes:
        raise CartServiceError(f"Size {size} is not available for this product")

    now = datetime.now(timezone.utc).isoformat()

    cart = await store.find_one(CARTS_COLLECTION, {"user_id": user_id})
    if not cart:
        # Create new cart
        cart_doc = {
            "user_id": user_id,
            "items": [{
                "product_id": product_id,
                "size": size,
                "quantity": quantity,
                "added_at": now,
            }],
            "updated_at": now,
        }
        await store.insert_one(CARTS_COLLECTION, cart_doc)
    else:
        items = cart.get("items", [])
        # Check if item already exists (same product + size)
        existing_idx = None
        for i, item in enumerate(items):
            if item["product_id"] == product_id and item.get("size") == size:
                existing_idx = i
                break

        if existing_idx is not None:
            items[existing_idx]["quantity"] += quantity
            items[existing_idx]["added_at"] = now
        else:
            items.append({
                "product_id": product_id,
                "size": size,
                "quantity": quantity,
                "added_at": now,
            })

        await store.update_one(
            CARTS_COLLECTION,
            {"user_id": user_id},
            {"$set": {"items": items, "updated_at": now}},
        )

    return await get_cart(store, user_id)


async def update_cart_item(
    store: JsonStore,
    user_id: str,
    product_id: str,
    size: Optional[str] = None,
    quantity: Optional[int] = None,
) -> CartResponse:
    """Update a cart item's size or quantity."""
    cart = await store.find_one(CARTS_COLLECTION, {"user_id": user_id})
    if not cart:
        raise CartServiceError("Cart not found")

    items = cart.get("items", [])
    found = False
    for item in items:
        if item["product_id"] == product_id:
            if size is not None:
                item["size"] = size
            if quantity is not None:
                item["quantity"] = quantity
            found = True
            break

    if not found:
        raise CartServiceError("Item not found in cart")

    now = datetime.now(timezone.utc).isoformat()
    await store.update_one(
        CARTS_COLLECTION,
        {"user_id": user_id},
        {"$set": {"items": items, "updated_at": now}},
    )

    return await get_cart(store, user_id)


async def remove_from_cart(
    store: JsonStore,
    user_id: str,
    product_id: str,
) -> CartResponse:
    """Remove an item from the cart."""
    cart = await store.find_one(CARTS_COLLECTION, {"user_id": user_id})
    if not cart:
        raise CartServiceError("Cart not found")

    items = cart.get("items", [])
    new_items = [item for item in items if item["product_id"] != product_id]

    if len(new_items) == len(items):
        raise CartServiceError("Item not found in cart")

    now = datetime.now(timezone.utc).isoformat()
    await store.update_one(
        CARTS_COLLECTION,
        {"user_id": user_id},
        {"$set": {"items": new_items, "updated_at": now}},
    )

    return await get_cart(store, user_id)


async def clear_cart(store: JsonStore, user_id: str) -> CartResponse:
    """Clear all items from the cart."""
    now = datetime.now(timezone.utc).isoformat()
    await store.update_one(
        CARTS_COLLECTION,
        {"user_id": user_id},
        {"$set": {"items": [], "updated_at": now}},
    )
    return CartResponse(items=[], total_items=0, total_price=0)


class CartServiceError(Exception):
    """Custom exception for cart service errors."""
    pass
