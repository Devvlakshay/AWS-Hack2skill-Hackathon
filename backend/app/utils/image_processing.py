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
MODEL_TARGET_SIZE = (768, 1024)  # Portrait aspect ratio to preserve full body + face
GARMENT_MIN_SIZE = (512, 512)
OUTPUT_FORMAT = "WEBP"
OUTPUT_QUALITY = 90


async def preprocess_model_image(image_bytes: bytes) -> bytes:
    """
    Preprocess model image for try-on generation.
    - Convert to RGB PNG format
    - Only resize if image is excessively large (>2048px) to stay within API limits
    - NO cropping, NO padding, NO filters — preserve the original image as-is
    """
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert("RGB")

    # Only downscale if too large for API (keep original quality otherwise)
    max_dim = 2048
    orig_w, orig_h = img.size
    if orig_w > max_dim or orig_h > max_dim:
        scale = min(max_dim / orig_w, max_dim / orig_h)
        img = img.resize((int(orig_w * scale), int(orig_h * scale)), Image.Resampling.LANCZOS)

    output = io.BytesIO()
    img.save(output, format="PNG", quality=95)
    output.seek(0)
    return output.read()


async def preprocess_user_photo(image_bytes: bytes) -> bytes:
    """
    Preprocess user-uploaded photo for try-on generation.
    Minimal processing to preserve the original face and identity.
    The AI model handles background/context understanding on its own.
    """
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert("RGB")
    orig_w, orig_h = img.size

    # Upscale only if very small (below 512px)
    min_dimension = min(orig_w, orig_h)
    if min_dimension < 512:
        scale = 512 / min_dimension
        img = img.resize(
            (int(orig_w * scale), int(orig_h * scale)),
            Image.Resampling.LANCZOS,
        )

    # Downscale only if too large for API
    max_dim = 2048
    w, h = img.size
    if w > max_dim or h > max_dim:
        scale = min(max_dim / w, max_dim / h)
        img = img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)

    output = io.BytesIO()
    img.save(output, format="PNG", quality=95)
    output.seek(0)
    return output.read()


def _create_studio_background(size: tuple[int, int]) -> Image.Image:
    """
    Create a clean studio-like gradient background matching the model photo style.
    Light neutral gray with subtle gradient — professional look.
    """
    width, height = size
    # Create a vertical gradient from light gray to slightly darker gray
    bg = np.zeros((height, width, 3), dtype=np.uint8)

    # Top color: light warm gray (#E8E4DC)
    top_color = np.array([232, 228, 220], dtype=np.float32)
    # Bottom color: slightly darker (#D0CBC2)
    bottom_color = np.array([208, 203, 194], dtype=np.float32)

    for y in range(height):
        ratio = y / max(height - 1, 1)
        color = top_color + (bottom_color - top_color) * ratio
        bg[y, :] = color.astype(np.uint8)

    bg_img = Image.fromarray(bg, "RGB").convert("RGBA")
    return bg_img


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
    Minimal processing — the AI output is already high quality.
    Just convert to WebP for optimized delivery.
    """
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert("RGB")

    # Only resize if too large, preserve aspect ratio
    max_w, max_h = 1024, 1366
    orig_w, orig_h = img.size
    if orig_w > max_w or orig_h > max_h:
        scale = min(max_w / orig_w, max_h / orig_h)
        img = img.resize((int(orig_w * scale), int(orig_h * scale)), Image.Resampling.LANCZOS)

    output = io.BytesIO()
    img.save(output, format=OUTPUT_FORMAT, quality=OUTPUT_QUALITY)
    output.seek(0)
    return output.read()


def _resize_and_crop(img: Image.Image, target_size: tuple[int, int]) -> Image.Image:
    """
    Resize image to fit within target size while maintaining aspect ratio.
    Uses letterboxing (padding) instead of cropping to preserve the full image
    — especially important for full-body model photos so faces and feet are never cut off.
    """
    target_w, target_h = target_size
    orig_w, orig_h = img.size

    # Scale to FIT inside the target (not cover) — preserves everything
    scale = min(target_w / orig_w, target_h / orig_h)
    new_w = int(orig_w * scale)
    new_h = int(orig_h * scale)
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Letterbox: place resized image centered on a background
    # Use a neutral studio-like background color
    bg_color = (232, 228, 220)  # warm light gray matching studio backdrop
    canvas = Image.new("RGB", (target_w, target_h), bg_color)
    paste_x = (target_w - new_w) // 2
    paste_y = (target_h - new_h) // 2
    canvas.paste(img, (paste_x, paste_y))
    return canvas


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
