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


async def preprocess_user_photo(image_bytes: bytes) -> bytes:
    """
    Preprocess user-uploaded photo for try-on generation.
    User photos often have messy backgrounds (beach, trees, forest, etc.)
    and lower quality than professional model photos. This function:
    1. Removes background and replaces with clean studio backdrop
    2. Upscales if resolution is too low
    3. Enhances quality (sharpen, denoise, exposure correction)
    4. Normalizes to 1024x1024 to match model photo quality
    """
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert("RGB")
    orig_w, orig_h = img.size

    # Step 1: Upscale if too small (below 768px on either side)
    min_dimension = min(orig_w, orig_h)
    if min_dimension < 768:
        scale = 768 / min_dimension
        img = img.resize(
            (int(orig_w * scale), int(orig_h * scale)),
            Image.Resampling.LANCZOS,
        )

    # Step 2: Remove background and replace with clean studio backdrop
    if HAS_REMBG:
        # Get the person with transparent background
        img_bytes_buf = io.BytesIO()
        img.save(img_bytes_buf, format="PNG")
        img_bytes_buf.seek(0)
        fg_bytes = rembg_remove(img_bytes_buf.read())
        fg_img = Image.open(io.BytesIO(fg_bytes)).convert("RGBA")

        # Create a clean studio-like gradient background
        studio_bg = _create_studio_background(fg_img.size)

        # Composite the person onto the studio background
        img = Image.alpha_composite(studio_bg, fg_img).convert("RGB")

    # Step 3: Enhance image quality
    # Denoise with slight blur then sharpen for clarity
    img = img.filter(ImageFilter.SMOOTH)
    img = img.filter(ImageFilter.SHARPEN)

    # Fix exposure / brightness
    brightness_enhancer = ImageEnhance.Brightness(img)
    img_array = np.array(img)
    mean_brightness = img_array.mean()
    if mean_brightness < 100:
        # Too dark — brighten
        img = brightness_enhancer.enhance(1.2)
    elif mean_brightness > 200:
        # Too bright — darken slightly
        img = brightness_enhancer.enhance(0.9)

    # Subtle contrast boost
    contrast_enhancer = ImageEnhance.Contrast(img)
    img = contrast_enhancer.enhance(1.1)

    # Subtle sharpening pass
    sharpness_enhancer = ImageEnhance.Sharpness(img)
    img = sharpness_enhancer.enhance(1.3)

    # OpenCV-based denoising if available
    if HAS_OPENCV:
        img_arr = np.array(img)
        img_bgr = cv2.cvtColor(img_arr, cv2.COLOR_RGB2BGR)
        # Non-local means denoising — removes noise while keeping edges
        img_bgr = cv2.fastNlMeansDenoisingColored(img_bgr, None, 6, 6, 7, 21)
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(img_rgb)

    # Step 4: Resize to 1024x1024 (same as model photos)
    img = _resize_and_crop(img, MODEL_TARGET_SIZE)

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

    # Step 5: Resize to fit within max dimensions while preserving aspect ratio
    # Do NOT force a square crop — preserve the full-body framing from AI output
    max_w, max_h = 1024, 1366  # Allow tall portrait images
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
