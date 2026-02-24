"""
Product Service for FitView AI.
Phase 2: Product & Model Management.
Handles CRUD operations and search for products.
"""

from datetime import datetime, timezone
from typing import Any, Optional

from app.models.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)
from app.utils.json_store import JsonStore

PRODUCT_COLLECTION = "products"


async def create_product(
    store: JsonStore,
    data: ProductCreate,
    retailer_id: str,
) -> ProductResponse:
    """Create a new product."""
    now = datetime.now(timezone.utc)
    product_dict = data.model_dump()
    product_dict["retailer_id"] = retailer_id
    product_dict["is_deleted"] = False
    product_dict["created_at"] = now.isoformat()
    product_dict["updated_at"] = now.isoformat()

    # Convert SizeStock models to dicts
    product_dict["sizes"] = [s if isinstance(s, dict) else s.model_dump() for s in (product_dict.get("sizes") or [])]

    inserted_id = await store.insert_one(PRODUCT_COLLECTION, product_dict)
    product_dict["_id"] = inserted_id
    return ProductResponse(**product_dict)


async def get_products(
    store: JsonStore,
    filters: Optional[dict[str, Any]] = None,
    page: int = 1,
    limit: int = 20,
    sort_by: str = "created_at",
    sort_order: int = -1,
) -> ProductListResponse:
    """Get products with filters, pagination, and sorting."""
    query: dict[str, Any] = {"is_deleted": False}
    filters = filters or {}

    if filters.get("category"):
        query["category"] = filters["category"]
    if filters.get("subcategory"):
        query["subcategory"] = filters["subcategory"]
    if filters.get("retailer_id"):
        query["retailer_id"] = filters["retailer_id"]
    if filters.get("price_min") is not None or filters.get("price_max") is not None:
        price_filter: dict[str, Any] = {}
        if filters.get("price_min") is not None:
            price_filter["$gte"] = filters["price_min"]
        if filters.get("price_max") is not None:
            price_filter["$lte"] = filters["price_max"]
        query["price"] = price_filter
    if filters.get("search"):
        query["$text"] = {"$search": filters["search"]}

    total = await store.count(PRODUCT_COLLECTION, query)

    skip = (page - 1) * limit
    sort_field = sort_by if sort_by in ("created_at", "price", "name") else "created_at"
    products_data = await store.find_many(
        PRODUCT_COLLECTION, query,
        sort_field=sort_field, sort_order=sort_order,
        skip=skip, limit=limit,
    )

    products = [ProductResponse(**doc) for doc in products_data]
    return ProductListResponse(products=products, total=total, page=page, limit=limit)


async def get_product_by_id(
    store: JsonStore,
    product_id: str,
) -> Optional[ProductResponse]:
    """Get a single product by ID."""
    doc = await store.find_one(PRODUCT_COLLECTION, {"_id": product_id, "is_deleted": False})
    if not doc:
        return None
    return ProductResponse(**doc)


async def update_product(
    store: JsonStore,
    product_id: str,
    data: ProductUpdate,
    retailer_id: str,
) -> Optional[ProductResponse]:
    """Update a product. Only the owning retailer can update."""
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_product_by_id(store, product_id)

    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    # Convert SizeStock models to dicts if present
    if "sizes" in update_data and update_data["sizes"] is not None:
        update_data["sizes"] = [
            s if isinstance(s, dict) else s.model_dump()
            for s in update_data["sizes"]
        ]

    result = await store.find_one_and_update(
        PRODUCT_COLLECTION,
        {"_id": product_id, "retailer_id": retailer_id, "is_deleted": False},
        {"$set": update_data},
    )
    if not result:
        return None
    return ProductResponse(**result)


async def delete_product(
    store: JsonStore,
    product_id: str,
    retailer_id: str,
) -> bool:
    """Soft delete a product. Only the owning retailer can delete."""
    modified = await store.update_one(
        PRODUCT_COLLECTION,
        {"_id": product_id, "retailer_id": retailer_id, "is_deleted": False},
        {"$set": {"is_deleted": True, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return modified > 0


async def search_products(
    store: JsonStore,
    query: str,
    page: int = 1,
    limit: int = 20,
) -> ProductListResponse:
    """Full-text search on products."""
    return await get_products(
        store,
        filters={"search": query},
        page=page,
        limit=limit,
    )
