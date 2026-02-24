"""
Product Service for FitView AI.
Phase 2: Product & Model Management.
Handles CRUD operations, search, caching for products.
"""

import json
from datetime import datetime, timezone
from typing import Any, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from redis.asyncio import Redis

from app.models.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)

PRODUCT_CACHE_TTL = 21600  # 6 hours in seconds
PRODUCT_COLLECTION = "products"


def _serialize_product(doc: dict) -> dict:
    """Convert MongoDB document to serializable dict."""
    doc["_id"] = str(doc["_id"])
    if "created_at" in doc and isinstance(doc["created_at"], datetime):
        pass  # Keep as datetime, Pydantic handles it
    if "updated_at" in doc and isinstance(doc["updated_at"], datetime):
        pass
    return doc


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    """Create necessary indexes for the products collection."""
    collection = db[PRODUCT_COLLECTION]
    await collection.create_index("retailer_id")
    await collection.create_index("category")
    await collection.create_index(
        [("name", "text"), ("description", "text"), ("tags", "text")],
        name="product_text_search",
    )


async def create_product(
    db: AsyncIOMotorDatabase,
    data: ProductCreate,
    retailer_id: str,
) -> ProductResponse:
    """Create a new product in MongoDB."""
    now = datetime.now(timezone.utc)
    product_dict = data.model_dump()
    product_dict["retailer_id"] = retailer_id
    product_dict["is_deleted"] = False
    product_dict["created_at"] = now
    product_dict["updated_at"] = now

    # Convert SizeStock models to dicts for MongoDB
    product_dict["sizes"] = [s if isinstance(s, dict) else s.model_dump() for s in (product_dict.get("sizes") or [])]

    result = await db[PRODUCT_COLLECTION].insert_one(product_dict)
    product_dict["_id"] = str(result.inserted_id)
    return ProductResponse(**product_dict)


async def get_products(
    db: AsyncIOMotorDatabase,
    filters: Optional[dict[str, Any]] = None,
    page: int = 1,
    limit: int = 20,
    sort_by: str = "created_at",
    sort_order: int = -1,
) -> ProductListResponse:
    """
    Get products with filters, pagination, and sorting.
    Filters: category, subcategory, price_min, price_max, search, retailer_id
    """
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

    collection = db[PRODUCT_COLLECTION]
    total = await collection.count_documents(query)

    skip = (page - 1) * limit
    sort_field = sort_by if sort_by in ("created_at", "price", "name") else "created_at"
    cursor = collection.find(query).sort(sort_field, sort_order).skip(skip).limit(limit)

    products = []
    async for doc in cursor:
        products.append(ProductResponse(**_serialize_product(doc)))

    return ProductListResponse(products=products, total=total, page=page, limit=limit)


async def get_product_by_id(
    db: AsyncIOMotorDatabase,
    product_id: str,
    redis: Optional[Redis] = None,
) -> Optional[ProductResponse]:
    """Get a single product by ID. Checks Redis cache first."""
    cache_key = f"product:{product_id}"

    # Check Redis cache
    if redis:
        try:
            cached = await redis.get(cache_key)
            if cached:
                data = json.loads(cached)
                return ProductResponse(**data)
        except Exception:
            pass  # Cache miss or error, fall through to DB

    # Fetch from MongoDB
    try:
        doc = await db[PRODUCT_COLLECTION].find_one(
            {"_id": ObjectId(product_id), "is_deleted": False}
        )
    except Exception:
        return None

    if not doc:
        return None

    product = ProductResponse(**_serialize_product(doc))

    # Cache the result
    if redis:
        try:
            await redis.setex(
                cache_key,
                PRODUCT_CACHE_TTL,
                product.model_dump_json(),
            )
        except Exception:
            pass  # Non-critical cache error

    return product


async def update_product(
    db: AsyncIOMotorDatabase,
    product_id: str,
    data: ProductUpdate,
    retailer_id: str,
    redis: Optional[Redis] = None,
) -> Optional[ProductResponse]:
    """Update a product. Only the owning retailer can update."""
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_product_by_id(db, product_id, redis)

    update_data["updated_at"] = datetime.now(timezone.utc)

    # Convert SizeStock models to dicts if present
    if "sizes" in update_data and update_data["sizes"] is not None:
        update_data["sizes"] = [
            s if isinstance(s, dict) else s.model_dump()
            for s in update_data["sizes"]
        ]

    try:
        result = await db[PRODUCT_COLLECTION].find_one_and_update(
            {"_id": ObjectId(product_id), "retailer_id": retailer_id, "is_deleted": False},
            {"$set": update_data},
            return_document=True,
        )
    except Exception:
        return None

    if not result:
        return None

    # Invalidate cache
    if redis:
        try:
            await redis.delete(f"product:{product_id}")
        except Exception:
            pass

    return ProductResponse(**_serialize_product(result))


async def delete_product(
    db: AsyncIOMotorDatabase,
    product_id: str,
    retailer_id: str,
    redis: Optional[Redis] = None,
) -> bool:
    """Soft delete a product. Only the owning retailer can delete."""
    try:
        result = await db[PRODUCT_COLLECTION].update_one(
            {"_id": ObjectId(product_id), "retailer_id": retailer_id, "is_deleted": False},
            {"$set": {"is_deleted": True, "updated_at": datetime.now(timezone.utc)}},
        )
    except Exception:
        return False

    if result.modified_count == 0:
        return False

    # Invalidate cache
    if redis:
        try:
            await redis.delete(f"product:{product_id}")
        except Exception:
            pass

    return True


async def search_products(
    db: AsyncIOMotorDatabase,
    query: str,
    page: int = 1,
    limit: int = 20,
) -> ProductListResponse:
    """Full-text search on products using MongoDB text index."""
    return await get_products(
        db,
        filters={"search": query},
        page=page,
        limit=limit,
    )
