"""
Image Storage Utility for FitView AI.
Handles image upload to AWS S3 (primary) with local filesystem fallback.
"""

import io
import logging
import os
import uuid

from PIL import Image

from app.core.config import settings
from app.utils.s3_storage import is_s3_available, get_s3_client, strip_exif

logger = logging.getLogger(__name__)

# Constraints
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MIN_RESOLUTION = 100
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}

# Thumbnail and web-optimized sizes
THUMBNAIL_SIZE = (300, 300)
WEB_OPTIMIZED_SIZE = (1024, 1024)

# Allowed upload folder names — prevent path traversal or arbitrary writes
ALLOWED_FOLDERS = {"products", "models", "user_photos", "tryon_results", "style_variations"}

# Content type mapping
EXT_CONTENT_TYPE = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "webp": "image/webp",
}


def validate_image(file_bytes: bytes) -> bool:
    """
    Validate an image file.
    Checks: format (JPEG/PNG/WebP), minimum resolution (100x100), max file size (10MB).
    Returns True if valid, raises ValueError otherwise.
    """
    if len(file_bytes) > MAX_FILE_SIZE:
        raise ValueError(
            f"File size ({len(file_bytes) / (1024 * 1024):.1f}MB) exceeds maximum of "
            f"{MAX_FILE_SIZE / (1024 * 1024):.0f}MB"
        )

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


def _resize_image(file_bytes: bytes, size: tuple[int, int], fmt: str = "PNG") -> bytes:
    """Resize an image to the given dimensions, maintaining aspect ratio."""
    img = Image.open(io.BytesIO(file_bytes))
    img = img.convert("RGB")

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
    """Generate web-optimized image (max 1024x1024) in PNG format."""
    return _resize_image(file_bytes, WEB_OPTIMIZED_SIZE)


def _validate_folder(folder: str) -> None:
    """Ensure the folder name is in the allowed list to prevent path traversal."""
    if folder not in ALLOWED_FOLDERS:
        raise ValueError(
            f"Invalid upload folder '{folder}'. Allowed folders: {', '.join(sorted(ALLOWED_FOLDERS))}"
        )


def _save_to_s3(file_bytes: bytes, folder: str, filename: str, ext: str = "png") -> str:
    """Upload image bytes to S3. Returns the public S3 URL."""
    key = f"{folder}/{filename}.{ext}"
    content_type = EXT_CONTENT_TYPE.get(ext, "image/png")

    client = get_s3_client()
    client.put_object(
        Bucket=settings.AWS_S3_BUCKET,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )

    # Return CloudFront URL if configured, otherwise direct S3 URL
    if settings.CLOUDFRONT_URL and not settings.CLOUDFRONT_URL.startswith("https://your-"):
        return f"{settings.CLOUDFRONT_URL}/{key}"
    return f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"


def _save_local(file_bytes: bytes, folder: str, filename: str, ext: str = "png") -> str:
    """Save image bytes to local filesystem. Returns the URL path."""
    upload_dir = os.path.join(settings.UPLOAD_DIR, folder)
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, f"{filename}.{ext}")
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    return f"{settings.BASE_URL}/uploads/{folder}/{filename}.{ext}"


def _save(file_bytes: bytes, folder: str, filename: str, ext: str = "png") -> str:
    """Save to S3 if available, otherwise fall back to local storage."""
    if is_s3_available():
        try:
            url = _save_to_s3(file_bytes, folder, filename, ext)
            logger.info(f"Uploaded to S3: {folder}/{filename}.{ext}")
            return url
        except Exception as e:
            logger.warning(f"S3 upload failed, falling back to local: {e}")

    return _save_local(file_bytes, folder, filename, ext)


def upload_image(file_bytes: bytes, folder: str, filename: str) -> str:
    """Upload an image. Uses S3 when configured, local storage as fallback. Strips EXIF metadata."""
    _validate_folder(folder)
    clean_bytes = strip_exif(file_bytes)
    return _save(clean_bytes, folder, filename)


def upload_image_multiple_sizes(
    file_bytes: bytes,
    folder: str,
    filename: str,
) -> dict[str, str]:
    """
    Upload original image plus thumbnail (300x300) and web-optimized (1024x1024).
    Strips EXIF metadata from the original before saving.
    Returns dict with keys: original, thumbnail, web_optimized.
    """
    _validate_folder(folder)

    # Strip EXIF from original before any processing
    clean_bytes = strip_exif(file_bytes)

    # Save original (detect format from cleaned bytes)
    img = Image.open(io.BytesIO(clean_bytes))
    original_ext = (img.format or "JPEG").lower()
    if original_ext == "jpeg":
        original_ext = "jpg"

    urls: dict[str, str] = {}
    urls["original"] = _save(clean_bytes, folder, f"{filename}_original", original_ext)
    urls["thumbnail"] = _save(generate_thumbnail(clean_bytes), folder, f"{filename}_thumb")
    urls["web_optimized"] = _save(generate_optimized(clean_bytes), folder, f"{filename}_web")

    return urls
