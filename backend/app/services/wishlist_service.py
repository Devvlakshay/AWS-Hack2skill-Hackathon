"""
Wishlist Service for FitView AI.
Phase 4: Intelligence Layer.

Manages wishlist operations using the JsonStore.
Each wishlist entry is a separate document linking user to product.
"""

import logging
from datetime import datetime, timezone

from app.models.wishlist import WishlistItemResponse, WishlistResponse
from app.utils.json_store import JsonStore

logger = logging.getLogger(__name__)

WISHLISTS_COLLECTION = "wishlists"


async def get_wishlist(store: JsonStore, user_id: str) -> WishlistResponse:
    """Get the user's wishlist with enriched product details."""
    wishlist_items = await store.find_many(
        WISHLISTS_COLLECTION,
        {"user_id": user_id},
        sort_field="added_at",
        sort_order=-1,
    )

    enriched_items: list[WishlistItemResponse] = []

    for item in wishlist_items:
        product = await store.find_one("products", {"_id": item["product_id"], "is_deleted": False})
        product_name = product.get("name", "Unknown Product") if product else "Unknown Product"
        product_price = product.get("price", 0) if product else 0
        product_images = product.get("images", []) if product else []
        product_image = product_images[0] if product_images else ""
        product_category = product.get("category", "") if product else ""

        enriched_items.append(WishlistItemResponse(
            _id=item["_id"],
            user_id=item["user_id"],
            product_id=item["product_id"],
            tryon_image_url=item.get("tryon_image_url", ""),
            added_at=item.get("added_at", ""),
            product_name=product_name,
            product_price=product_price,
            product_image=product_image,
            product_category=product_category,
        ))

    return WishlistResponse(items=enriched_items, total=len(enriched_items))


async def add_to_wishlist(
    store: JsonStore,
    user_id: str,
    product_id: str,
    tryon_image_url: str = "",
) -> WishlistResponse:
    """Add a product to the user's wishlist."""
    # Verify product exists
    product = await store.find_one("products", {"_id": product_id, "is_deleted": False})
    if not product:
        raise WishlistServiceError("Product not found")

    # Check if already in wishlist
    existing = await store.find_one(
        WISHLISTS_COLLECTION,
        {"user_id": user_id, "product_id": product_id},
    )
    if existing:
        raise WishlistServiceError("Product is already in your wishlist")

    now = datetime.now(timezone.utc).isoformat()
    wishlist_doc = {
        "user_id": user_id,
        "product_id": product_id,
        "tryon_image_url": tryon_image_url,
        "added_at": now,
    }

    await store.insert_one(WISHLISTS_COLLECTION, wishlist_doc)
    return await get_wishlist(store, user_id)


async def remove_from_wishlist(
    store: JsonStore,
    user_id: str,
    product_id: str,
) -> WishlistResponse:
    """Remove a product from the user's wishlist."""
    deleted = await store.delete_one(
        WISHLISTS_COLLECTION,
        {"user_id": user_id, "product_id": product_id},
    )
    if deleted == 0:
        raise WishlistServiceError("Product not found in your wishlist")

    return await get_wishlist(store, user_id)


async def is_in_wishlist(
    store: JsonStore,
    user_id: str,
    product_id: str,
) -> bool:
    """Check if a product is in the user's wishlist."""
    existing = await store.find_one(
        WISHLISTS_COLLECTION,
        {"user_id": user_id, "product_id": product_id},
    )
    return existing is not None


class WishlistServiceError(Exception):
    """Custom exception for wishlist service errors."""
    pass
