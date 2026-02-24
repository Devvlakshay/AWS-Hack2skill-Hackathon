"""
Fashion Model Service for FitView AI.
Phase 2: Product & Model Management.
Handles CRUD operations for fashion models.
"""

from datetime import datetime, timezone
from typing import Any, Optional

from app.models.model import (
    ModelCreate,
    ModelListResponse,
    ModelResponse,
    ModelUpdate,
)
from app.utils.json_store import JsonStore

MODEL_COLLECTION = "models"


async def create_model(
    store: JsonStore,
    data: ModelCreate,
    retailer_id: str,
) -> ModelResponse:
    """Create a new fashion model."""
    now = datetime.now(timezone.utc)
    model_dict = data.model_dump()
    model_dict["retailer_id"] = retailer_id
    model_dict["usage_count"] = 0
    model_dict["is_active"] = True
    model_dict["is_deleted"] = False
    model_dict["created_at"] = now.isoformat()
    model_dict["updated_at"] = now.isoformat()

    # Convert measurements to dict for storage
    if "measurements" in model_dict and hasattr(model_dict["measurements"], "model_dump"):
        model_dict["measurements"] = model_dict["measurements"].model_dump()

    inserted_id = await store.insert_one(MODEL_COLLECTION, model_dict)
    model_dict["_id"] = inserted_id
    return ModelResponse(**model_dict)


async def get_models(
    store: JsonStore,
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

    total = await store.count(MODEL_COLLECTION, query)

    skip = (page - 1) * limit
    models_data = await store.find_many(
        MODEL_COLLECTION, query,
        sort_field="created_at", sort_order=-1,
        skip=skip, limit=limit,
    )

    models = [ModelResponse(**doc) for doc in models_data]
    return ModelListResponse(models=models, total=total, page=page, limit=limit)


async def get_model_by_id(
    store: JsonStore,
    model_id: str,
) -> Optional[ModelResponse]:
    """Get a single fashion model by ID."""
    doc = await store.find_one(MODEL_COLLECTION, {"_id": model_id, "is_deleted": False})
    if not doc:
        return None
    return ModelResponse(**doc)


async def update_model(
    store: JsonStore,
    model_id: str,
    data: ModelUpdate,
    retailer_id: str,
) -> Optional[ModelResponse]:
    """Update a fashion model. Only the owning retailer can update."""
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_model_by_id(store, model_id)

    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    # Convert measurements to dict if present
    if "measurements" in update_data and update_data["measurements"] is not None:
        if hasattr(update_data["measurements"], "model_dump"):
            update_data["measurements"] = update_data["measurements"].model_dump()

    result = await store.find_one_and_update(
        MODEL_COLLECTION,
        {"_id": model_id, "retailer_id": retailer_id, "is_deleted": False},
        {"$set": update_data},
    )
    if not result:
        return None
    return ModelResponse(**result)


async def delete_model(
    store: JsonStore,
    model_id: str,
    retailer_id: str,
) -> bool:
    """Soft delete a fashion model. Only the owning retailer can delete."""
    modified = await store.update_one(
        MODEL_COLLECTION,
        {"_id": model_id, "retailer_id": retailer_id, "is_deleted": False},
        {"$set": {
            "is_deleted": True,
            "is_active": False,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
    )
    return modified > 0


async def increment_usage_count(
    store: JsonStore,
    model_id: str,
) -> bool:
    """Increment the usage count for a fashion model."""
    modified = await store.update_one(
        MODEL_COLLECTION,
        {"_id": model_id, "is_deleted": False},
        {"$inc": {"usage_count": 1}},
    )
    return modified > 0
