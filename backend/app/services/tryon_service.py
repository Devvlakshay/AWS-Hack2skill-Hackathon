"""
Try-On Service for FitView AI.
Phase 3: Core Virtual Try-On Engine.

Orchestrates the full try-on pipeline:
1. Check cache for existing result
2. Fetch model + product images
3. Preprocess images (resize, background removal, normalization)
4. Call Gemini API for AI generation
5. Postprocess result (enhance, color correct, format)
6. Upload result to storage
7. Save try-on session to store
8. Cache result
9. Return CDN URL
"""

import io
import logging
import os
import time
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from app.core.config import settings
from app.models.tryon import BatchTryOnResponse, TryOnHistoryResponse, TryOnResponse
from app.utils.ai_clients import (
    GeminiImageError,
    gemini_image_client,
)
from app.utils.image_processing import (
    postprocess_tryon_image,
    preprocess_garment_image,
    preprocess_model_image,
)
from app.utils.json_store import JsonStore
from app.utils.storage import upload_image

logger = logging.getLogger(__name__)

TRYON_COLLECTION = "tryon_sessions"

# In-memory cache for try-on results (simulates Redis)
_tryon_cache: dict[str, dict[str, Any]] = {}
CACHE_TTL_SECONDS = 3600  # 1 hour


def _cache_key(model_id: str, product_id: str) -> str:
    return f"tryon:{model_id}:{product_id}"


def _get_cached(key: str) -> Optional[dict]:
    if key in _tryon_cache:
        entry = _tryon_cache[key]
        if time.time() < entry["expires_at"]:
            return entry["data"]
        del _tryon_cache[key]
    return None


def _set_cache(key: str, data: dict) -> None:
    _tryon_cache[key] = {
        "data": data,
        "expires_at": time.time() + CACHE_TTL_SECONDS,
    }


async def generate_tryon(
    store: JsonStore,
    model_id: str,
    product_id: str,
    user_id: str,
) -> TryOnResponse:
    """
    Generate a virtual try-on image.

    Pipeline: cache check -> fetch -> preprocess -> AI generate -> postprocess -> store -> return
    """
    start_time = time.time()

    # Step 1: Check cache
    cache_key = _cache_key(model_id, product_id)
    cached = _get_cached(cache_key)
    if cached:
        # Create a new session entry for this user even if result is cached
        session = await _create_session(
            store, user_id, model_id, product_id,
            cached["result_url"], cached["model_name"], cached["product_name"],
            cached["model_image_url"], cached["product_image_url"],
            int((time.time() - start_time) * 1000),
        )
        logger.info(f"Try-on served from cache for model={model_id}, product={product_id}")
        return session

    # Step 2: Fetch model and product data
    model_doc = await store.find_one("models", {"_id": model_id, "is_deleted": False})
    if not model_doc:
        raise TryOnError("Model not found or has been deleted")

    product_doc = await store.find_one("products", {"_id": product_id, "is_deleted": False})
    if not product_doc:
        raise TryOnError("Product not found or has been deleted")

    model_image_url = model_doc.get("image_url", "")
    product_images = product_doc.get("images", [])
    product_image_url = product_images[0] if product_images else ""

    if not model_image_url:
        raise TryOnError("Model does not have an image uploaded")
    if not product_image_url:
        raise TryOnError("Product does not have any images uploaded")

    # Step 3: Load images from local storage
    model_image_bytes = _load_image_from_url(model_image_url)
    garment_image_bytes = _load_image_from_url(product_image_url)

    if not model_image_bytes:
        raise TryOnError("Failed to load model image")
    if not garment_image_bytes:
        raise TryOnError("Failed to load garment image")

    # Step 4: Preprocess images
    preprocessed_model = await preprocess_model_image(model_image_bytes)
    preprocessed_garment = await preprocess_garment_image(garment_image_bytes)

    # Step 5: Call AI API for generation
    # Priority: Gemini -> Fallback composite
    generated_image = None
    ai_provider = "fallback"

    if gemini_image_client.is_available:
        try:
            generated_image = await gemini_image_client.generate_tryon(
                model_image=preprocessed_model,
                garment_image=preprocessed_garment,
            )
            ai_provider = "gemini"
            logger.info("Try-on generated via Gemini API")
        except GeminiImageError as e:
            logger.warning(f"Gemini API failed: {e}. Using fallback composite.")

    if generated_image is None:
        logger.warning("Gemini API unavailable. Using fallback composite.")
        generated_image = await _create_fallback_composite(
            preprocessed_model, preprocessed_garment
        )

    # Step 6: Postprocess the result
    final_image = await postprocess_tryon_image(generated_image)

    # Step 7: Upload result to storage
    result_filename = f"tryon_{uuid.uuid4().hex}"
    result_url = upload_image(final_image, "tryon_results", result_filename)

    # Step 8: Cache the result
    model_name = model_doc.get("name", "")
    product_name = product_doc.get("name", "")
    _set_cache(cache_key, {
        "result_url": result_url,
        "model_name": model_name,
        "product_name": product_name,
        "model_image_url": model_image_url,
        "product_image_url": product_image_url,
    })

    # Step 9: Increment model usage count
    await store.update_one(
        "models", {"_id": model_id}, {"$inc": {"usage_count": 1}}
    )

    # Step 10: Save session and return
    elapsed_ms = int((time.time() - start_time) * 1000)
    session = await _create_session(
        store, user_id, model_id, product_id,
        result_url, model_name, product_name,
        model_image_url, product_image_url,
        elapsed_ms,
        ai_provider=ai_provider,
    )

    logger.info(
        f"Try-on generated in {elapsed_ms}ms via {ai_provider} for model={model_id}, product={product_id}"
    )
    return session


async def generate_batch_tryon(
    store: JsonStore,
    model_id: str,
    product_ids: list[str],
    user_id: str,
) -> BatchTryOnResponse:
    """
    Generate try-on images for multiple garments.
    Produces individual results for each garment + a combined outfit result.
    """
    start_time = time.time()
    batch_id = uuid.uuid4().hex

    # Step 1: Generate individual try-ons for each product
    individual_results: list[TryOnResponse] = []
    for product_id in product_ids:
        result = await generate_tryon(store, model_id, product_id, user_id)
        individual_results.append(result)

    # Step 2: Generate combined outfit if 2+ garments
    combined_result = None
    if len(product_ids) >= 2:
        combined_result = await _generate_combined_outfit(
            store, model_id, product_ids, user_id
        )

    total_ms = int((time.time() - start_time) * 1000)
    return BatchTryOnResponse(
        batch_id=batch_id,
        individual_results=individual_results,
        combined_result=combined_result,
        total_processing_time_ms=total_ms,
        product_count=len(product_ids),
    )


async def _generate_combined_outfit(
    store: JsonStore,
    model_id: str,
    product_ids: list[str],
    user_id: str,
) -> TryOnResponse:
    """Generate a single image with the model wearing all garments together."""
    start_time = time.time()

    # Check cache
    sorted_ids = sorted(product_ids)
    cache_key = f"tryon_combined:{model_id}:{':'.join(sorted_ids)}"
    cached = _get_cached(cache_key)

    # Fetch model
    model_doc = await store.find_one("models", {"_id": model_id, "is_deleted": False})
    if not model_doc:
        raise TryOnError("Model not found or has been deleted")

    model_image_url = model_doc.get("image_url", "")
    model_name = model_doc.get("name", "")

    if cached:
        session = await _create_session(
            store, user_id, model_id, ",".join(sorted_ids),
            cached["result_url"], model_name,
            f"Combined Outfit ({len(product_ids)} items)",
            model_image_url, cached.get("product_image_url", ""),
            int((time.time() - start_time) * 1000),
        )
        return session

    # Load model image
    model_image_bytes = _load_image_from_url(model_image_url)
    if not model_image_bytes:
        raise TryOnError("Failed to load model image")
    preprocessed_model = await preprocess_model_image(model_image_bytes)

    # Load and preprocess all garment images
    garment_bytes_list: list[bytes] = []
    first_product_image_url = ""
    for pid in product_ids:
        product_doc = await store.find_one("products", {"_id": pid, "is_deleted": False})
        if not product_doc:
            raise TryOnError(f"Product {pid} not found")
        product_images = product_doc.get("images", [])
        if not product_images:
            raise TryOnError(f"Product {pid} has no images")
        if not first_product_image_url:
            first_product_image_url = product_images[0]
        garment_raw = _load_image_from_url(product_images[0])
        if not garment_raw:
            raise TryOnError(f"Failed to load image for product {pid}")
        preprocessed = await preprocess_garment_image(garment_raw)
        garment_bytes_list.append(preprocessed)

    # Try Gemini multi-garment, fall back to composite
    generated_image = None
    ai_provider = "fallback"

    if gemini_image_client.is_available:
        try:
            generated_image = await gemini_image_client.generate_multi_garment_tryon(
                model_image=preprocessed_model,
                garment_images=garment_bytes_list,
            )
            ai_provider = "gemini"
            logger.info("Combined outfit generated via Gemini API")
        except GeminiImageError as e:
            logger.warning(f"Gemini multi-garment failed: {e}. Using fallback.")

    if generated_image is None:
        generated_image = await _create_multi_fallback_composite(
            preprocessed_model, garment_bytes_list
        )

    final_image = await postprocess_tryon_image(generated_image)
    result_filename = f"tryon_combined_{uuid.uuid4().hex}"
    result_url = upload_image(final_image, "tryon_results", result_filename)

    _set_cache(cache_key, {
        "result_url": result_url,
        "model_name": model_name,
        "product_name": f"Combined Outfit ({len(product_ids)} items)",
        "model_image_url": model_image_url,
        "product_image_url": first_product_image_url,
    })

    elapsed_ms = int((time.time() - start_time) * 1000)
    session = await _create_session(
        store, user_id, model_id, ",".join(sorted_ids),
        result_url, model_name,
        f"Combined Outfit ({len(product_ids)} items)",
        model_image_url, first_product_image_url,
        elapsed_ms, ai_provider=ai_provider,
    )
    logger.info(f"Combined outfit generated in {elapsed_ms}ms via {ai_provider}")
    return session


async def generate_tryon_with_user_photo(
    store: JsonStore,
    user_photo_bytes: bytes,
    product_id: str,
    user_id: str,
    user_photo_url: str,
) -> TryOnResponse:
    """
    Generate a virtual try-on image using a user-uploaded photo.

    Similar to generate_tryon but takes raw photo bytes instead of a model_id.
    """
    start_time = time.time()

    # Fetch product data
    product_doc = await store.find_one("products", {"_id": product_id, "is_deleted": False})
    if not product_doc:
        raise TryOnError("Product not found or has been deleted")

    product_images = product_doc.get("images", [])
    product_image_url = product_images[0] if product_images else ""

    if not product_image_url:
        raise TryOnError("Product does not have any images uploaded")

    # Load garment image from local storage
    garment_image_bytes = _load_image_from_url(product_image_url)
    if not garment_image_bytes:
        raise TryOnError("Failed to load garment image")

    # Preprocess images
    preprocessed_model = await preprocess_model_image(user_photo_bytes)
    preprocessed_garment = await preprocess_garment_image(garment_image_bytes)

    # Call AI API for generation: Gemini -> Fallback composite
    generated_image = None
    ai_provider = "fallback"

    if gemini_image_client.is_available:
        try:
            generated_image = await gemini_image_client.generate_tryon(
                model_image=preprocessed_model,
                garment_image=preprocessed_garment,
            )
            ai_provider = "gemini"
            logger.info("Try-on (user photo) generated via Gemini API")
        except GeminiImageError as e:
            logger.warning(f"Gemini API failed: {e}. Using fallback composite.")

    if generated_image is None:
        logger.warning("Gemini API unavailable. Using fallback composite for user photo.")
        generated_image = await _create_fallback_composite(
            preprocessed_model, preprocessed_garment
        )

    # Postprocess the result
    final_image = await postprocess_tryon_image(generated_image)

    # Upload result to storage
    result_filename = f"tryon_{uuid.uuid4().hex}"
    result_url = upload_image(final_image, "tryon_results", result_filename)

    # Save session and return
    product_name = product_doc.get("name", "")
    elapsed_ms = int((time.time() - start_time) * 1000)

    session = await _create_session(
        store, user_id, "user_upload", product_id,
        result_url, "Your Photo", product_name,
        user_photo_url, product_image_url,
        elapsed_ms,
        ai_provider=ai_provider,
    )

    logger.info(
        f"Try-on (user photo) generated in {elapsed_ms}ms via {ai_provider} for product={product_id}"
    )
    return session


async def get_tryon_history(
    store: JsonStore,
    user_id: str,
    page: int = 1,
    limit: int = 20,
) -> TryOnHistoryResponse:
    """Get try-on history for a user with pagination."""
    query = {"user_id": user_id}
    total = await store.count(TRYON_COLLECTION, query)

    skip = (page - 1) * limit
    sessions_data = await store.find_many(
        TRYON_COLLECTION, query,
        sort_field="created_at", sort_order=-1,
        skip=skip, limit=limit,
    )

    sessions = [TryOnResponse(**doc) for doc in sessions_data]
    return TryOnHistoryResponse(sessions=sessions, total=total, page=page, limit=limit)


async def get_tryon_by_id(
    store: JsonStore,
    session_id: str,
    user_id: str,
) -> Optional[TryOnResponse]:
    """Get a specific try-on session."""
    doc = await store.find_one(TRYON_COLLECTION, {"_id": session_id, "user_id": user_id})
    if not doc:
        return None
    return TryOnResponse(**doc)


async def toggle_favorite(
    store: JsonStore,
    session_id: str,
    user_id: str,
    is_favorite: bool,
) -> Optional[TryOnResponse]:
    """Toggle favorite status on a try-on session."""
    result = await store.find_one_and_update(
        TRYON_COLLECTION,
        {"_id": session_id, "user_id": user_id},
        {"$set": {"is_favorite": is_favorite}},
    )
    if not result:
        return None
    return TryOnResponse(**result)


async def _create_session(
    store: JsonStore,
    user_id: str,
    model_id: str,
    product_id: str,
    result_url: str,
    model_name: str,
    product_name: str,
    model_image_url: str,
    product_image_url: str,
    processing_time_ms: int,
    ai_provider: str = "fallback",
) -> TryOnResponse:
    """Create and persist a try-on session document."""
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=90)

    session_doc = {
        "user_id": user_id,
        "model_id": model_id,
        "product_id": product_id,
        "result_url": result_url,
        "model_name": model_name,
        "product_name": product_name,
        "model_image_url": model_image_url,
        "product_image_url": product_image_url,
        "status": "completed",
        "processing_time_ms": processing_time_ms,
        "is_favorite": False,
        "ai_provider": ai_provider,
        "created_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
    }

    inserted_id = await store.insert_one(TRYON_COLLECTION, session_doc)
    session_doc["_id"] = inserted_id
    return TryOnResponse(**session_doc)


def _load_image_from_url(url: str) -> Optional[bytes]:
    """Load image bytes from a local upload URL."""
    # Convert URL to local file path
    # URL format: http://localhost:8000/uploads/folder/filename.ext
    if "/uploads/" in url:
        relative_path = url.split("/uploads/", 1)[1]
        local_path = os.path.join(settings.UPLOAD_DIR, relative_path)
        if os.path.exists(local_path):
            with open(local_path, "rb") as f:
                return f.read()
    return None


async def _create_fallback_composite(
    model_bytes: bytes, garment_bytes: bytes
) -> bytes:
    """
    Create a polished fallback composite image when all AI APIs are unavailable.
    Uses alpha blending with gradient edges, color matching, and boundary
    smoothing for a more natural overlay.
    """
    from PIL import Image, ImageFilter
    import numpy as np

    model_img = Image.open(io.BytesIO(model_bytes)).convert("RGBA")
    garment_img = Image.open(io.BytesIO(garment_bytes)).convert("RGBA")

    model_w, model_h = model_img.size

    # Resize garment proportionally to model's torso (55% width, maintain aspect ratio)
    garment_target_w = int(model_w * 0.55)
    garment_orig_w, garment_orig_h = garment_img.size
    aspect_ratio = garment_orig_h / garment_orig_w
    garment_target_h = int(garment_target_w * aspect_ratio)
    # Cap height to 50% of model to avoid overflow
    garment_target_h = min(garment_target_h, int(model_h * 0.50))

    garment_img = garment_img.resize(
        (garment_target_w, garment_target_h), Image.Resampling.LANCZOS
    )

    # Apply slight perspective squish (narrower at top) for more natural drape
    from PIL import ImageTransform
    top_inset = int(garment_target_w * 0.03)
    garment_img = garment_img.transform(
        (garment_target_w, garment_target_h),
        ImageTransform.QuadTransform([
            top_inset, 0,                           # top-left
            garment_target_w - top_inset, 0,         # top-right
            garment_target_w, garment_target_h,      # bottom-right
            0, garment_target_h,                     # bottom-left
        ]),
        resample=Image.Resampling.BICUBIC,
    )

    # Color-match garment to model lighting by adjusting brightness
    model_np = np.array(model_img.convert("RGB")).astype(np.float32)
    garment_np = np.array(garment_img.convert("RGB")).astype(np.float32)

    # Compare average brightness of model torso region vs garment
    torso_y_start = int(model_h * 0.15)
    torso_y_end = int(model_h * 0.55)
    torso_region = model_np[torso_y_start:torso_y_end, :, :]
    model_brightness = np.mean(torso_region)
    garment_brightness = np.mean(garment_np)

    if garment_brightness > 0:
        brightness_ratio = model_brightness / garment_brightness
        # Clamp to avoid extreme adjustments
        brightness_ratio = max(0.7, min(1.3, brightness_ratio))
        garment_np = np.clip(garment_np * brightness_ratio, 0, 255).astype(np.uint8)
        garment_rgb = Image.fromarray(garment_np)
        # Preserve original alpha channel
        garment_img = Image.merge("RGBA", (*garment_rgb.split(), garment_img.split()[3]))

    # Create gradient alpha mask for soft edges (feathered border)
    alpha = garment_img.split()[3]
    # Blur the alpha channel edges for smooth blending
    alpha = alpha.filter(ImageFilter.GaussianBlur(radius=3))

    # Create a gradient fade on the edges (20px feather)
    alpha_np = np.array(alpha).astype(np.float32)
    feather = 20
    h, w = alpha_np.shape
    for i in range(feather):
        factor = i / feather
        # Top edge
        alpha_np[i, :] *= factor
        # Bottom edge
        alpha_np[h - 1 - i, :] *= factor
        # Left edge
        alpha_np[:, i] *= factor
        # Right edge
        alpha_np[:, w - 1 - i] *= factor
    alpha = Image.fromarray(alpha_np.clip(0, 255).astype(np.uint8))
    garment_img.putalpha(alpha)

    # Position garment at center of model's upper body
    paste_x = (model_w - garment_target_w) // 2
    paste_y = int(model_h * 0.18)

    # Composite with alpha blending
    composite = model_img.copy()
    composite.paste(garment_img, (paste_x, paste_y), garment_img)

    # Apply light Gaussian blur at the boundary to smooth edges
    composite = composite.convert("RGB")
    # Slight overall sharpen to compensate for blending softness
    composite = composite.filter(ImageFilter.SHARPEN)

    output = io.BytesIO()
    composite.save(output, format="PNG", quality=95)
    output.seek(0)
    return output.read()


async def _create_multi_fallback_composite(
    model_bytes: bytes, garment_bytes_list: list[bytes]
) -> bytes:
    """
    Create a fallback composite with multiple garments overlaid at staggered
    vertical positions when AI APIs are unavailable.
    """
    from PIL import Image, ImageFilter
    import numpy as np

    model_img = Image.open(io.BytesIO(model_bytes)).convert("RGBA")
    model_w, model_h = model_img.size
    composite = model_img.copy()

    # Stagger garments vertically with decreasing width
    width_ratios = [0.55, 0.45, 0.40, 0.35, 0.30]
    y_offsets = [0.18, 0.45, 0.60, 0.70, 0.78]

    for i, garment_raw in enumerate(garment_bytes_list):
        garment_img = Image.open(io.BytesIO(garment_raw)).convert("RGBA")

        ratio = width_ratios[min(i, len(width_ratios) - 1)]
        y_off = y_offsets[min(i, len(y_offsets) - 1)]

        target_w = int(model_w * ratio)
        orig_w, orig_h = garment_img.size
        aspect = orig_h / orig_w
        target_h = min(int(target_w * aspect), int(model_h * 0.35))

        garment_img = garment_img.resize((target_w, target_h), Image.Resampling.LANCZOS)

        # Feathered alpha edges
        alpha = garment_img.split()[3]
        alpha = alpha.filter(ImageFilter.GaussianBlur(radius=3))
        alpha_np = np.array(alpha).astype(np.float32)
        feather = 15
        h, w = alpha_np.shape
        for f in range(feather):
            factor = f / feather
            alpha_np[f, :] *= factor
            alpha_np[h - 1 - f, :] *= factor
            alpha_np[:, f] *= factor
            alpha_np[:, w - 1 - f] *= factor
        garment_img.putalpha(Image.fromarray(alpha_np.clip(0, 255).astype(np.uint8)))

        paste_x = (model_w - target_w) // 2
        paste_y = int(model_h * y_off)
        composite.paste(garment_img, (paste_x, paste_y), garment_img)

    composite = composite.convert("RGB")
    composite = composite.filter(ImageFilter.SHARPEN)

    output = io.BytesIO()
    composite.save(output, format="PNG", quality=95)
    output.seek(0)
    return output.read()


class TryOnError(Exception):
    """Custom exception for try-on pipeline errors."""
    pass
