"""
Image Processing Utilities for FitView AI.
Phase 3: Core Virtual Try-On Engine.

Handles preprocessing (resize, background removal, normalization)
and postprocessing (enhancement, color correction, format conversion).
"""

import io
from typing import Optional

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

# Try to import optional dependencies gracefully
try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False

try:
    from rembg import remove as rembg_remove
    HAS_REMBG = True
except ImportError:
    HAS_REMBG = False


# Constants
MODEL_TARGET_SIZE = (1024, 1024)
GARMENT_MIN_SIZE = (512, 512)
OUTPUT_FORMAT = "PNG"
OUTPUT_QUALITY = 90


async def preprocess_model_image(image_bytes: bytes) -> bytes:
    """
    Preprocess model image for try-on generation.
    - Resize to 1024x1024
    - Normalize to RGB format
    - Return processed bytes
    """
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert("RGB")

    # Resize to target size maintaining aspect ratio, then center crop
    img = _resize_and_crop(img, MODEL_TARGET_SIZE)

    # Normalize pixel values
    img_array = np.array(img, dtype=np.float32)
    img_array = np.clip(img_array, 0, 255).astype(np.uint8)
    img = Image.fromarray(img_array)

    output = io.BytesIO()
    img.save(output, format="PNG", quality=95)
    output.seek(0)
    return output.read()


async def preprocess_garment_image(image_bytes: bytes) -> bytes:
    """
    Preprocess garment image for try-on generation.
    - Resize to minimum 512x512
    - Remove background using rembg (U2-Net model)
    - Normalize to RGBA format for clean garment isolation
    - Return processed bytes
    """
    img = Image.open(io.BytesIO(image_bytes))

    # Ensure minimum size
    width, height = img.size
    if width < GARMENT_MIN_SIZE[0] or height < GARMENT_MIN_SIZE[1]:
        scale = max(GARMENT_MIN_SIZE[0] / width, GARMENT_MIN_SIZE[1] / height)
        new_size = (int(width * scale), int(height * scale))
        img = img.resize(new_size, Image.Resampling.LANCZOS)

    # Remove background using rembg if available
    if HAS_REMBG:
        img_bytes = io.BytesIO()
        img.save(img_bytes, format="PNG")
        img_bytes.seek(0)
        result_bytes = rembg_remove(img_bytes.read())
        img = Image.open(io.BytesIO(result_bytes))
    else:
        img = img.convert("RGBA")

    output = io.BytesIO()
    img.save(output, format="PNG", quality=95)
    output.seek(0)
    return output.read()


async def postprocess_tryon_image(image_bytes: bytes) -> bytes:
    """
    Post-process the AI-generated try-on image.
    - Quality enhancement: sharpening, contrast adjustment
    - Color correction
    - Artifact removal / boundary smoothing
    - Convert to WebP for optimized delivery
    """
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert("RGB")

    # Step 1: Sharpening
    img = img.filter(ImageFilter.SHARPEN)

    # Step 2: Contrast enhancement (subtle)
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.05)

    # Step 3: Color enhancement (subtle)
    color_enhancer = ImageEnhance.Color(img)
    img = color_enhancer.enhance(1.03)

    # Step 4: OpenCV-based color correction and smoothing if available
    if HAS_OPENCV:
        img = _opencv_postprocess(img)

    # Step 5: Final resize to 1024x1024 and convert to WebP
    img = _resize_and_crop(img, MODEL_TARGET_SIZE)

    output = io.BytesIO()
    img.save(output, format=OUTPUT_FORMAT, quality=OUTPUT_QUALITY)
    output.seek(0)
    return output.read()


def _resize_and_crop(img: Image.Image, target_size: tuple[int, int]) -> Image.Image:
    """Resize image to fit target size while maintaining aspect ratio, then center crop."""
    target_w, target_h = target_size
    orig_w, orig_h = img.size

    # Calculate scale to cover the target area
    scale = max(target_w / orig_w, target_h / orig_h)
    new_w = int(orig_w * scale)
    new_h = int(orig_h * scale)
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Center crop to exact target size
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    img = img.crop((left, top, left + target_w, top + target_h))
    return img


def _opencv_postprocess(img: Image.Image) -> Image.Image:
    """Apply OpenCV-based postprocessing for color correction and smoothing."""
    img_array = np.array(img)
    img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

    # Color correction using CLAHE (Contrast Limited Adaptive Histogram Equalization)
    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_channel = clahe.apply(l_channel)
    lab = cv2.merge([l_channel, a_channel, b_channel])
    img_bgr = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

    # Light bilateral filter for smoothing while preserving edges
    img_bgr = cv2.bilateralFilter(img_bgr, d=5, sigmaColor=50, sigmaSpace=50)

    # Convert back to RGB PIL Image
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    return Image.fromarray(img_rgb)
