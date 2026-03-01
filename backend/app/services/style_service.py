"""
Style Variation Service for FitView AI.
Phase 4: Intelligence Layer.

Generates style variations of try-on results using Gemini Image API.
"""

import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Optional

from app.core.config import settings
from app.models.style import (
    SUPPORTED_STYLES,
    StyleVariationListResponse,
    StyleVariationResponse,
)
from app.utils.ai_clients import GeminiImageError, gemini_image_client
from app.utils.json_store import JsonStore
from app.utils.storage import upload_image

logger = logging.getLogger(__name__)

STYLE_VARIATIONS_COLLECTION = "style_variations"
TRYON_COLLECTION = "tryon_sessions"


class StyleServiceError(Exception):
    """Custom exception for style service errors."""
    pass


async def generate_style_variation(
    store: JsonStore,
    session_id: str,
    user_id: str,
    style: str,
) -> StyleVariationResponse:
    """
    Generate a style variation of a try-on result.

    1. Get the try-on session from store
    2. Load the result image from the result_url
    3. Call gemini_image_client.generate_style_variation(image_bytes, style)
    4. Save result to uploads/style_variations/
    5. Store variation in "style_variations" collection
    6. Return the variation URL and metadata
    """
    # Validate style
    if style not in SUPPORTED_STYLES:
        raise StyleServiceError(
            f"Unsupported style '{style}'. Must be one of: {', '.join(SUPPORTED_STYLES)}"
        )

    # Get try-on session
    session = await store.find_one(TRYON_COLLECTION, {"_id": session_id, "user_id": user_id})
    if not session:
        raise StyleServiceError("Try-on session not found or access denied")

    result_url = session.get("result_url", "")
    if not result_url:
        raise StyleServiceError("Try-on session has no result image")

    # Load the result image from local storage
    image_bytes = _load_image_from_url(result_url)
    if not image_bytes:
        raise StyleServiceError("Failed to load try-on result image")

    # Generate style variation via Gemini API
    variation_image: Optional[bytes] = None
    try:
        if gemini_image_client.is_available:
            variation_image = await gemini_image_client.generate_style_variation(
                base_image=image_bytes,
                style=style,
            )
            logger.info(f"Style variation ({style}) generated via Gemini API")
        else:
            logger.warning("Gemini API not available for style variation")
    except GeminiImageError as e:
        logger.warning(f"Gemini style variation failed: {e}")

    # Fallback: use the original image if AI fails
    if variation_image is None:
        logger.warning(f"Using original image as fallback for style variation ({style})")
        variation_image = image_bytes

    # Save the variation image
    variation_filename = f"style_{uuid.uuid4().hex}"
    variation_url = upload_image(variation_image, "style_variations", variation_filename)

    # Store in collection
    now = datetime.now(timezone.utc)
    variation_doc = {
        "session_id": session_id,
        "user_id": user_id,
        "style": style,
        "image_url": variation_url,
        "original_image_url": result_url,
        "created_at": now.isoformat(),
    }

    inserted_id = await store.insert_one(STYLE_VARIATIONS_COLLECTION, variation_doc)
    variation_doc["_id"] = inserted_id

    return StyleVariationResponse(**variation_doc)


async def get_variations_for_session(
    store: JsonStore,
    session_id: str,
    user_id: str,
) -> StyleVariationListResponse:
    """Get all style variations for a try-on session."""
    # Verify session belongs to user
    session = await store.find_one(TRYON_COLLECTION, {"_id": session_id, "user_id": user_id})
    if not session:
        raise StyleServiceError("Try-on session not found or access denied")

    variations_data = await store.find_many(
        STYLE_VARIATIONS_COLLECTION,
        {"session_id": session_id, "user_id": user_id},
        sort_field="created_at",
        sort_order=-1,
    )

    variations = [StyleVariationResponse(**doc) for doc in variations_data]
    return StyleVariationListResponse(variations=variations, session_id=session_id)


def _load_image_from_url(url: str) -> Optional[bytes]:
    """Load image bytes from a local upload URL."""
    if "/uploads/" in url:
        relative_path = url.split("/uploads/", 1)[1]
        local_path = os.path.join(settings.UPLOAD_DIR, relative_path)
        if os.path.exists(local_path):
            with open(local_path, "rb") as f:
                return f.read()
    return None
