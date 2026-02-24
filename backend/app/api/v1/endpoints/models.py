"""
Fashion Model API endpoints for FitView AI.
Phase 2: Product & Model Management.
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from redis.asyncio import Redis

from app.core.deps import get_current_user, get_db, get_redis
from app.models.model import (
    BodyType,
    ModelCreate,
    ModelListResponse,
    ModelResponse,
    ModelSize,
    ModelUpdate,
    SkinTone,
)
from app.services import model_service
from app.utils.storage import upload_image_multiple_sizes, validate_image

router = APIRouter(prefix="/models", tags=["models"])


@router.post("", response_model=ModelResponse, status_code=status.HTTP_201_CREATED)
async def create_model(
    data: ModelCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Create a new fashion model. Retailer only."""
    if current_user.get("role") != "retailer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only retailers can create models",
        )

    retailer_id = str(current_user["_id"])

    # Ensure indexes on first use
    await model_service.ensure_indexes(db)

    model = await model_service.create_model(db, data, retailer_id)
    return model


@router.get("", response_model=ModelListResponse)
async def list_models(
    body_type: Optional[BodyType] = Query(None),
    size: Optional[ModelSize] = Query(None),
    skin_tone: Optional[SkinTone] = Query(None),
    retailer_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List fashion models with filters and pagination."""
    filters = {}
    if body_type:
        filters["body_type"] = body_type.value
    if size:
        filters["size"] = size.value
    if skin_tone:
        filters["skin_tone"] = skin_tone.value
    if retailer_id:
        filters["retailer_id"] = retailer_id

    return await model_service.get_models(db, filters, page, limit)


@router.get("/{model_id}", response_model=ModelResponse)
async def get_model(
    model_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    """Get a single fashion model by ID."""
    model = await model_service.get_model_by_id(db, model_id, redis)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found",
        )
    return model


@router.put("/{model_id}", response_model=ModelResponse)
async def update_model(
    model_id: str,
    data: ModelUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    """Update a fashion model. Retailer owner only."""
    if current_user.get("role") != "retailer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only retailers can update models",
        )

    retailer_id = str(current_user["_id"])
    model = await model_service.update_model(db, model_id, data, retailer_id, redis)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found or you are not the owner",
        )
    return model


@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_model(
    model_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    """Delete a fashion model (soft delete). Retailer owner only."""
    if current_user.get("role") != "retailer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only retailers can delete models",
        )

    retailer_id = str(current_user["_id"])
    deleted = await model_service.delete_model(db, model_id, retailer_id, redis)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found or you are not the owner",
        )
    return None


@router.post("/{model_id}/image", response_model=ModelResponse)
async def upload_model_image(
    model_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    """Upload an image for a fashion model. Retailer owner only."""
    if current_user.get("role") != "retailer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only retailers can upload model images",
        )

    retailer_id = str(current_user["_id"])

    # Check model exists and belongs to retailer
    model = await model_service.get_model_by_id(db, model_id, redis)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found",
        )
    if model.retailer_id != retailer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the owner of this model",
        )

    # Read and validate the image
    file_bytes = await file.read()
    try:
        validate_image(file_bytes)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    # Upload to Cloudinary with multiple sizes
    filename = f"{model_id}_{uuid.uuid4().hex[:8]}"
    try:
        urls = upload_image_multiple_sizes(file_bytes, "models", filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image upload failed: {str(e)}",
        )

    # Update model with the original image URL
    updated = await model_service.update_model(
        db,
        model_id,
        ModelUpdate(image_url=urls["original"]),
        retailer_id,
        redis,
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update model with new image",
        )
    return updated
