"""
Image Storage Utility for FitView AI.
Phase 2: Product & Model Management.
Handles image upload (local or Cloudinary), validation, and resizing.
"""

import io
import os
import uuid
from typing import Optional

from PIL import Image

from app.core.config import settings

# Constraints
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MIN_RESOLUTION = 512
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}

# Thumbnail and web-optimized sizes
THUMBNAIL_SIZE = (300, 300)
WEB_OPTIMIZED_SIZE = (1024, 1024)


def _use_cloudinary() -> bool:
    """Check if Cloudinary is configured."""
    return bool(
        settings.CLOUDINARY_CLOUD_NAME
        and settings.CLOUDINARY_API_KEY
        and settings.CLOUDINARY_API_SECRET
    )


def _configure_cloudinary() -> None:
    """Configure Cloudinary SDK from settings."""
    import cloudinary

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


def validate_image(file_bytes: bytes) -> bool:
    """
    Validate an image file.
    Checks: format (JPEG/PNG/WebP), minimum resolution (512x512), max file size (10MB).
    Returns True if valid, raises ValueError otherwise.
    """
    # Check file size
    if len(file_bytes) > MAX_FILE_SIZE:
        raise ValueError(
            f"File size ({len(file_bytes) / (1024 * 1024):.1f}MB) exceeds maximum of "
            f"{MAX_FILE_SIZE / (1024 * 1024):.0f}MB"
        )

    # Check format and resolution
    try:
        img = Image.open(io.BytesIO(file_bytes))
    except Exception:
        raise ValueError("Invalid image file. Could not open image.")

    fmt = img.format
    if fmt not in ALLOWED_FORMATS:
        raise ValueError(
            f"Unsupported image format: {fmt}. Allowed formats: {', '.join(ALLOWED_FORMATS)}"
        )

    width, height = img.size
    if width < MIN_RESOLUTION or height < MIN_RESOLUTION:
        raise ValueError(
            f"Image resolution ({width}x{height}) is below minimum ({MIN_RESOLUTION}x{MIN_RESOLUTION})"
        )

    return True


def _resize_image(file_bytes: bytes, size: tuple[int, int], fmt: str = "WEBP") -> bytes:
    """Resize an image to the given dimensions, maintaining aspect ratio."""
    img = Image.open(io.BytesIO(file_bytes))
    img = img.convert("RGB")

    # Use thumbnail to maintain aspect ratio
    img_copy = img.copy()
    img_copy.thumbnail(size, Image.Resampling.LANCZOS)

    output = io.BytesIO()
    img_copy.save(output, format=fmt, quality=85)
    output.seek(0)
    return output.read()


def generate_thumbnail(file_bytes: bytes) -> bytes:
    """Generate a 300x300 thumbnail from image bytes."""
    return _resize_image(file_bytes, THUMBNAIL_SIZE)


def generate_optimized(file_bytes: bytes) -> bytes:
    """Generate web-optimized image (max 1024x1024) in WebP format."""
    return _resize_image(file_bytes, WEB_OPTIMIZED_SIZE)


def _save_local(file_bytes: bytes, folder: str, filename: str, ext: str = "webp") -> str:
    """Save image bytes to local filesystem. Returns the URL path."""
    upload_dir = os.path.join(settings.UPLOAD_DIR, folder)
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, f"{filename}.{ext}")
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Return URL path (served by FastAPI static files)
    return f"{settings.BASE_URL}/uploads/{folder}/{filename}.{ext}"


def _upload_cloudinary(file_bytes: bytes, folder: str, filename: str) -> str:
    """Upload image bytes to Cloudinary. Returns the secure URL."""
    import cloudinary.uploader

    _configure_cloudinary()

    public_id = f"{folder}/{filename}"
    result = cloudinary.uploader.upload(
        file_bytes,
        public_id=public_id,
        overwrite=True,
        resource_type="image",
    )
    return result.get("secure_url", "")


def upload_image(file_bytes: bytes, folder: str, filename: str) -> str:
    """
    Upload an image. Uses Cloudinary if configured, otherwise local storage.
    Returns the URL of the uploaded image.
    """
    if _use_cloudinary():
        return _upload_cloudinary(file_bytes, folder, filename)
    return _save_local(file_bytes, folder, filename)


def upload_image_multiple_sizes(
    file_bytes: bytes,
    folder: str,
    filename: str,
) -> dict[str, str]:
    """
    Upload original image plus thumbnail (300x300) and web-optimized (1024x1024).
    Returns dict with keys: original, thumbnail, web_optimized.
    """
    urls: dict[str, str] = {}

    if _use_cloudinary():
        import cloudinary.uploader

        _configure_cloudinary()

        # Upload original
        original_result = cloudinary.uploader.upload(
            file_bytes,
            public_id=f"{folder}/{filename}_original",
            overwrite=True,
            resource_type="image",
        )
        urls["original"] = original_result.get("secure_url", "")

        # Create and upload thumbnail
        thumbnail_bytes = generate_thumbnail(file_bytes)
        thumb_result = cloudinary.uploader.upload(
            thumbnail_bytes,
            public_id=f"{folder}/{filename}_thumb",
            overwrite=True,
            resource_type="image",
        )
        urls["thumbnail"] = thumb_result.get("secure_url", "")

        # Create and upload web-optimized
        web_bytes = generate_optimized(file_bytes)
        web_result = cloudinary.uploader.upload(
            web_bytes,
            public_id=f"{folder}/{filename}_web",
            overwrite=True,
            resource_type="image",
        )
        urls["web_optimized"] = web_result.get("secure_url", "")
    else:
        # Local storage fallback
        # Save original (as-is, detect format)
        img = Image.open(io.BytesIO(file_bytes))
        original_ext = (img.format or "JPEG").lower()
        if original_ext == "jpeg":
            original_ext = "jpg"
        urls["original"] = _save_local(file_bytes, folder, f"{filename}_original", original_ext)

        # Thumbnail
        thumbnail_bytes = generate_thumbnail(file_bytes)
        urls["thumbnail"] = _save_local(thumbnail_bytes, folder, f"{filename}_thumb")

        # Web-optimized
        web_bytes = generate_optimized(file_bytes)
        urls["web_optimized"] = _save_local(web_bytes, folder, f"{filename}_web")

    return urls


def delete_image(public_id: str) -> bool:
    """Delete an image from Cloudinary by its public ID (only works with Cloudinary)."""
    if not _use_cloudinary():
        return False

    import cloudinary.uploader

    _configure_cloudinary()

    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception:
        return False
