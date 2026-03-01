"""
Try-On API Endpoints for FitView AI.
Phase 3: Core Virtual Try-On Engine.

POST /tryon              - Generate a virtual try-on image (model + product)
POST /tryon/with-photo   - Generate a virtual try-on image (user photo + product)
GET  /tryon/history      - Get user's try-on history
GET  /tryon/{id}         - Get a specific try-on session
PATCH /tryon/{id}/favorite - Toggle favorite on a try-on session
"""

import os
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from PIL import Image
import io

from app.core.config import settings
from app.core.deps import get_current_user, get_store
from app.models.tryon import (
    BatchTryOnRequest,
    BatchTryOnResponse,
    TryOnFavoriteRequest,
    TryOnHistoryResponse,
    TryOnRequest,
    TryOnResponse,
)
from app.services.tryon_service import (
    TryOnError,
    generate_batch_tryon,
    generate_tryon,
    generate_tryon_with_user_photo,
    get_tryon_by_id,
    get_tryon_history,
    toggle_favorite,
)
from app.utils.json_store import JsonStore

router = APIRouter(prefix="/tryon", tags=["Try-On"])

# Constants for user photo validation
MAX_PHOTO_SIZE = 10 * 1024 * 1024  # 10MB
MIN_PHOTO_RESOLUTION = 512
ALLOWED_PHOTO_TYPES = {"image/jpeg", "image/png"}


@router.post("", response_model=TryOnResponse, status_code=status.HTTP_201_CREATED)
async def create_tryon(
    request: TryOnRequest,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """
    Generate a virtual try-on image.
    Customer selects a model and a product, AI generates the try-on result.
    """
    try:
        result = await generate_tryon(
            store=store,
            model_id=request.model_id,
            product_id=request.product_id,
            user_id=current_user["_id"],
        )
        return result
    except TryOnError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Try-on generation failed: {str(e)}",
        )


@router.post("/batch", response_model=BatchTryOnResponse, status_code=status.HTTP_201_CREATED)
async def create_batch_tryon(
    request: BatchTryOnRequest,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """
    Generate try-on images for multiple garments at once.
    Returns individual results for each garment plus a combined outfit image.
    """
    try:
        result = await generate_batch_tryon(
            store=store,
            model_id=request.model_id,
            product_ids=request.product_ids,
            user_id=current_user["_id"],
        )
        return result
    except TryOnError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch try-on generation failed: {str(e)}",
        )


@router.post("/with-photo", response_model=TryOnResponse, status_code=status.HTTP_201_CREATED)
async def create_tryon_with_photo(
    file: UploadFile = File(..., description="User's photo (JPEG or PNG, min 512x512, max 10MB)"),
    product_id: str = Form(..., description="Product/garment ID"),
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """
    Generate a virtual try-on image using user's own uploaded photo.
    Accepts multipart form data with the user's photo and a product ID.
    """
    # Validate content type
    if file.content_type not in ALLOWED_PHOTO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type: {file.content_type}. Allowed: JPEG, PNG.",
        )

    # Read file bytes
    file_bytes = await file.read()

    # Validate file size
    if len(file_bytes) > MAX_PHOTO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size ({len(file_bytes) / (1024 * 1024):.1f}MB) exceeds maximum of 10MB.",
        )

    # Validate image dimensions
    try:
        img = Image.open(io.BytesIO(file_bytes))
        width, height = img.size
        if width < MIN_PHOTO_RESOLUTION or height < MIN_PHOTO_RESOLUTION:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image resolution ({width}x{height}) is below minimum ({MIN_PHOTO_RESOLUTION}x{MIN_PHOTO_RESOLUTION}).",
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image file. Could not open image.",
        )

    # Save user photo to uploads/user_photos/
    user_id = current_user["_id"]
    photo_filename = f"{user_id}_{uuid.uuid4().hex}.png"
    photo_dir = os.path.join(settings.UPLOAD_DIR, "user_photos")
    os.makedirs(photo_dir, exist_ok=True)
    photo_path = os.path.join(photo_dir, photo_filename)

    # Convert to PNG and save
    img_rgb = img.convert("RGB")
    img_rgb.save(photo_path, format="PNG")

    user_photo_url = f"{settings.BASE_URL}/uploads/user_photos/{photo_filename}"

    # Generate try-on
    try:
        result = await generate_tryon_with_user_photo(
            store=store,
            user_photo_bytes=file_bytes,
            product_id=product_id,
            user_id=user_id,
            user_photo_url=user_photo_url,
        )
        return result
    except TryOnError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Try-on generation failed: {str(e)}",
        )


@router.get("/history", response_model=TryOnHistoryResponse)
async def list_tryon_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Get the current user's try-on history with pagination."""
    return await get_tryon_history(
        store=store,
        user_id=current_user["_id"],
        page=page,
        limit=limit,
    )


@router.get("/{session_id}", response_model=TryOnResponse)
async def get_tryon_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Get a specific try-on session by ID."""
    result = await get_tryon_by_id(
        store=store,
        session_id=session_id,
        user_id=current_user["_id"],
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Try-on session not found",
        )
    return result


@router.patch("/{session_id}/favorite", response_model=TryOnResponse)
async def toggle_tryon_favorite(
    session_id: str,
    request: TryOnFavoriteRequest,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Toggle favorite status on a try-on session."""
    result = await toggle_favorite(
        store=store,
        session_id=session_id,
        user_id=current_user["_id"],
        is_favorite=request.is_favorite,
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Try-on session not found",
        )
    return result
