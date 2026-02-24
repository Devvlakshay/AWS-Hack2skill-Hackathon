"""
Fashion Model Service for FitView AI.
Phase 2: Product & Model Management.
Handles CRUD operations and caching for fashion models.
"""

import json
from datetime import datetime, timezone
from typing import Any, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from redis.asyncio import Redis

from app.models.model import (
    ModelCreate,
    ModelListResponse,
    ModelResponse,
    ModelUpdate,
)

MODEL_CACHE_TTL = 21600  # 6 hours in seconds
MODEL_COLLECTION = "models"


def _serialize_model(doc: dict) -> dict:
    """Convert MongoDB document to serializable dict."""
    doc["_id"] = str(doc["_id"])
    return doc


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    """Create necessary indexes for the models collection."""
    collection = db[MODEL_COLLECTION]
    await collection.create_index("retailer_id")
    await collection.create_index("body_type")
    await collection.create_index("is_active")


async def create_model(
    db: AsyncIOMotorDatabase,
    data: ModelCreate,
    retailer_id: str,
) -> ModelResponse:
    """Create a new fashion model in MongoDB."""
    now = datetime.now(timezone.utc)
    model_dict = data.model_dump()
    model_dict["retailer_id"] = retailer_id
    model_dict["usage_count"] = 0
    model_dict["is_active"] = True
    model_dict["is_deleted"] = False
    model_dict["created_at"] = now
    model_dict["updated_at"] = now

    # Convert measurements to dict for MongoDB
    if "measurements" in model_dict and hasattr(model_dict["measurements"], "model_dump"):
        model_dict["measurements"] = model_dict["measurements"].model_dump()

    result = await db[MODEL_COLLECTION].insert_one(model_dict)
    model_dict["_id"] = str(result.inserted_id)
    return ModelResponse(**model_dict)


async def get_models(
    db: AsyncIOMotorDatabase,
    filters: Optional[dict[str, Any]] = None,
    page: int = 1,
    limit: int = 20,
) -> ModelListResponse:
    """Get fashion models with filters and pagination."""
    query: dict[str, Any] = {"is_deleted": False}
    filters = filters or {}

    if filters.get("body_type"):
        query["body_type"] = filters["body_type"]
    if filters.get("size"):
        query["size"] = filters["size"]
    if filters.get("skin_tone"):
        query["skin_tone"] = filters["skin_tone"]
    if filters.get("retailer_id"):
        query["retailer_id"] = filters["retailer_id"]
    if filters.get("is_active") is not None:
        query["is_active"] = filters["is_active"]

    collection = db[MODEL_COLLECTION]
    total = await collection.count_documents(query)

    skip = (page - 1) * limit
    cursor = collection.find(query).sort("created_at", -1).skip(skip).limit(limit)

    models = []
    async for doc in cursor:
        models.append(ModelResponse(**_serialize_model(doc)))

    return ModelListResponse(models=models, total=total, page=page, limit=limit)


async def get_model_by_id(
    db: AsyncIOMotorDatabase,
    model_id: str,
    redis: Optional[Redis] = None,
) -> Optional[ModelResponse]:
    """Get a single fashion model by ID. Checks Redis cache first."""
    cache_key = f"model:{model_id}"

    # Check Redis cache
    if redis:
        try:
            cached = await redis.get(cache_key)
            if cached:
                data = json.loads(cached)
                return ModelResponse(**data)
        except Exception:
            pass

    # Fetch from MongoDB
    try:
        doc = await db[MODEL_COLLECTION].find_one(
            {"_id": ObjectId(model_id), "is_deleted": False}
        )
    except Exception:
        return None

    if not doc:
        return None

    model = ModelResponse(**_serialize_model(doc))

    # Cache the result
    if redis:
        try:
            await redis.setex(
                cache_key,
                MODEL_CACHE_TTL,
                model.model_dump_json(),
            )
        except Exception:
            pass

    return model


async def update_model(
    db: AsyncIOMotorDatabase,
    model_id: str,
    data: ModelUpdate,
    retailer_id: str,
    redis: Optional[Redis] = None,
) -> Optional[ModelResponse]:
    """Update a fashion model. Only the owning retailer can update."""
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_model_by_id(db, model_id, redis)

    update_data["updated_at"] = datetime.now(timezone.utc)

    # Convert measurements to dict if present
    if "measurements" in update_data and update_data["measurements"] is not None:
        if hasattr(update_data["measurements"], "model_dump"):
            update_data["measurements"] = update_data["measurements"].model_dump()

    try:
        result = await db[MODEL_COLLECTION].find_one_and_update(
            {"_id": ObjectId(model_id), "retailer_id": retailer_id, "is_deleted": False},
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
            await redis.delete(f"model:{model_id}")
        except Exception:
            pass

    return ModelResponse(**_serialize_model(result))


async def delete_model(
    db: AsyncIOMotorDatabase,
    model_id: str,
    retailer_id: str,
    redis: Optional[Redis] = None,
) -> bool:
    """Soft delete a fashion model. Only the owning retailer can delete."""
    try:
        result = await db[MODEL_COLLECTION].update_one(
            {"_id": ObjectId(model_id), "retailer_id": retailer_id, "is_deleted": False},
            {
                "$set": {
                    "is_deleted": True,
                    "is_active": False,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )
    except Exception:
        return False

    if result.modified_count == 0:
        return False

    # Invalidate cache
    if redis:
        try:
            await redis.delete(f"model:{model_id}")
        except Exception:
            pass

    return True


async def increment_usage_count(
    db: AsyncIOMotorDatabase,
    model_id: str,
    redis: Optional[Redis] = None,
) -> bool:
    """Increment the usage count for a fashion model."""
    try:
        result = await db[MODEL_COLLECTION].update_one(
            {"_id": ObjectId(model_id), "is_deleted": False},
            {"$inc": {"usage_count": 1}},
        )
    except Exception:
        return False

    if result.modified_count == 0:
        return False

    # Invalidate cache so next read gets fresh count
    if redis:
        try:
            await redis.delete(f"model:{model_id}")
        except Exception:
            pass

    return True
