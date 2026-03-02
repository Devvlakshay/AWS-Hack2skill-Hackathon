import io
import logging
import uuid
from typing import Optional
import boto3
from botocore.exceptions import ClientError
from PIL import Image
from app.core.config import settings

logger = logging.getLogger(__name__)

_s3_client = None


def get_s3_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )
    return _s3_client


def is_s3_available() -> bool:
    return bool(settings.AWS_ACCESS_KEY_ID and settings.AWS_S3_BUCKET)


async def upload_to_s3(
    file_bytes: bytes,
    folder: str,
    filename: Optional[str] = None,
    ext: str = "webp",
    content_type: str = "image/webp",
) -> str:
    """Upload bytes to S3 and return public URL."""
    if not is_s3_available():
        raise ValueError("S3 not configured")

    filename = filename or str(uuid.uuid4())
    key = f"{folder}/{filename}.{ext}"

    try:
        client = get_s3_client()
        client.put_object(
            Bucket=settings.AWS_S3_BUCKET,
            Key=key,
            Body=file_bytes,
            ContentType=content_type,
        )

        # Return CDN URL if configured, else S3 URL
        if settings.CLOUDFRONT_URL:
            return f"{settings.CLOUDFRONT_URL}/{key}"
        return f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"

    except ClientError as e:
        logger.error(f"S3 upload failed: {e}")
        raise


async def delete_from_s3(key: str) -> bool:
    """Delete object from S3."""
    if not is_s3_available():
        return False
    try:
        client = get_s3_client()
        client.delete_object(Bucket=settings.AWS_S3_BUCKET, Key=key)
        return True
    except ClientError as e:
        logger.error(f"S3 delete failed: {e}")
        return False


def strip_exif(image_bytes: bytes) -> bytes:
    """Remove EXIF metadata from image for privacy."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        # Convert to RGB to drop EXIF
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGBA")
        else:
            img = img.convert("RGB")
        output = io.BytesIO()
        img.save(output, format="PNG", optimize=True)
        output.seek(0)
        return output.read()
    except Exception:
        return image_bytes
