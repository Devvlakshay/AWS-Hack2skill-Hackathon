"""
Generate sample model and product images for FitView AI.
Creates professional-looking placeholder images using Pillow.
These serve as showcase images until Gemini API quota resets.

Usage: python3 scripts/generate_sample_images.py
"""

import io
import json
import math
import os
import random
import sys

from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(UPLOADS_DIR, "models")
PRODUCTS_DIR = os.path.join(UPLOADS_DIR, "products")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(PRODUCTS_DIR, exist_ok=True)

BASE_URL = "http://localhost:8000"

# ─────────────────────────────────────────────
# Color palettes
# ─────────────────────────────────────────────

SKIN_COLORS = {
    "fair": (245, 222, 199),
    "medium": (224, 190, 158),
    "olive": (198, 166, 125),
    "brown": (165, 126, 90),
    "dark": (120, 85, 58),
}

PRODUCT_PALETTES = [
    {"bg": (30, 58, 138), "accent": (96, 165, 250), "label": "Royal Blue"},       # prod001
    {"bg": (250, 250, 250), "accent": (148, 163, 184), "label": "White Formal"},   # prod002
    {"bg": (6, 78, 59), "accent": (52, 211, 153), "label": "Emerald Green"},       # prod003
    {"bg": (30, 41, 59), "accent": (99, 102, 241), "label": "Indigo Denim"},       # prod004
    {"bg": (127, 29, 29), "accent": (252, 165, 165), "label": "Red Silk"},         # prod005
    {"bg": (24, 24, 27), "accent": (161, 161, 170), "label": "Black Graphic"},     # prod006
    {"bg": (30, 41, 59), "accent": (56, 189, 248), "label": "Navy Bomber"},        # prod007
    {"bg": (255, 241, 242), "accent": (251, 113, 133), "label": "Pastel Pink"},    # prod008
    {"bg": (254, 249, 195), "accent": (250, 204, 21), "label": "Yellow Floral"},   # prod009
    {"bg": (245, 245, 220), "accent": (120, 113, 108), "label": "Beige Linen"},    # prod010
]


def draw_silhouette(draw, cx, cy, height, skin_color, body_type="average"):
    """Draw a stylized human silhouette."""
    # Body proportions based on body type
    widths = {
        "slim": 0.28,
        "average": 0.33,
        "curvy": 0.38,
        "plus_size": 0.42,
    }
    body_width_ratio = widths.get(body_type, 0.33)

    head_r = int(height * 0.08)
    body_w = int(height * body_width_ratio)
    body_h = int(height * 0.35)
    hip_w = int(body_w * 1.15) if body_type in ("curvy", "plus_size") else body_w
    leg_h = int(height * 0.42)

    # Head
    head_y = cy - int(height * 0.45)
    draw.ellipse(
        [cx - head_r, head_y - head_r, cx + head_r, head_y + head_r],
        fill=skin_color,
    )

    # Neck
    neck_w = int(head_r * 0.6)
    neck_top = head_y + head_r
    neck_bot = neck_top + int(height * 0.04)
    draw.rectangle([cx - neck_w, neck_top, cx + neck_w, neck_bot], fill=skin_color)

    # Torso (slightly tapered)
    shoulder_y = neck_bot
    waist_y = shoulder_y + body_h
    points = [
        (cx - body_w // 2, shoulder_y),
        (cx + body_w // 2, shoulder_y),
        (cx + hip_w // 2, waist_y),
        (cx - hip_w // 2, waist_y),
    ]
    draw.polygon(points, fill=skin_color)

    # Legs
    leg_w = int(body_w * 0.22)
    leg_gap = int(body_w * 0.08)
    leg_top = waist_y
    leg_bot = leg_top + leg_h

    # Left leg
    draw.rectangle(
        [cx - leg_gap - leg_w, leg_top, cx - leg_gap, leg_bot],
        fill=skin_color,
    )
    # Right leg
    draw.rectangle(
        [cx + leg_gap, leg_top, cx + leg_gap + leg_w, leg_bot],
        fill=skin_color,
    )

    # Arms
    arm_w = int(body_w * 0.14)
    arm_start_x_l = cx - body_w // 2 - arm_w
    arm_start_x_r = cx + body_w // 2
    arm_top = shoulder_y + int(height * 0.02)
    arm_bot = arm_top + int(height * 0.3)

    draw.rectangle([arm_start_x_l, arm_top, arm_start_x_l + arm_w, arm_bot], fill=skin_color)
    draw.rectangle([arm_start_x_r, arm_top, arm_start_x_r + arm_w, arm_bot], fill=skin_color)


def create_gradient(width, height, color1, color2, direction="vertical"):
    """Create a gradient image."""
    img = Image.new("RGB", (width, height))
    pixels = img.load()
    for y in range(height):
        for x in range(width):
            if direction == "vertical":
                ratio = y / height
            else:
                ratio = x / width
            r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
            g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
            b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
            pixels[x, y] = (r, g, b)
    return img


def add_text(draw, text, x, y, size=24, color=(255, 255, 255)):
    """Add text to image (uses default font)."""
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
    except (OSError, IOError):
        font = ImageFont.load_default()
    draw.text((x, y), text, fill=color, font=font)


def create_model_image(model_data):
    """Create a professional-looking model placeholder image."""
    w, h = 768, 1024
    skin_tone = model_data.get("skin_tone", "medium")
    body_type = model_data.get("body_type", "average")
    name = model_data.get("name", "Model")

    skin_color = SKIN_COLORS.get(skin_tone, SKIN_COLORS["medium"])

    # Background gradient (studio-like)
    bg_top = (40, 40, 50)
    bg_bot = (80, 75, 90)
    img = create_gradient(w, h, bg_top, bg_bot)
    draw = ImageDraw.Draw(img)

    # Subtle radial light effect
    for i in range(150, 0, -1):
        alpha = int(20 * (i / 150))
        r = int(w * 0.6 * (i / 150))
        cx, cy = w // 2, int(h * 0.4)
        draw.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=(bg_top[0] + alpha, bg_top[1] + alpha, bg_top[2] + alpha),
        )

    draw = ImageDraw.Draw(img)

    # Draw model silhouette
    silhouette_h = int(h * 0.75)
    draw_silhouette(draw, w // 2, int(h * 0.55), silhouette_h, skin_color, body_type)

    # Add simple clothing (grey dress/outfit) over torso
    body_widths = {"slim": 0.28, "average": 0.33, "curvy": 0.38, "plus_size": 0.42}
    bw_ratio = body_widths.get(body_type, 0.33)
    outfit_w = int(silhouette_h * bw_ratio)
    outfit_color = (100, 100, 115)
    shoulder_y = int(h * 0.55) - int(silhouette_h * 0.45) + int(silhouette_h * 0.08) + int(silhouette_h * 0.04)
    waist_y = shoulder_y + int(silhouette_h * 0.35)
    hip_w = int(outfit_w * 1.15) if body_type in ("curvy", "plus_size") else outfit_w
    dress_bot = waist_y + int(silhouette_h * 0.25)

    # Dress shape
    points = [
        (w // 2 - outfit_w // 2, shoulder_y),
        (w // 2 + outfit_w // 2, shoulder_y),
        (w // 2 + hip_w // 2 + 15, dress_bot),
        (w // 2 - hip_w // 2 - 15, dress_bot),
    ]
    draw.polygon(points, fill=outfit_color)

    # Name label at bottom
    add_text(draw, name.split(" - ")[0] if " - " in name else name, 24, h - 80, size=28, color=(255, 255, 255))
    # Body type + size label
    size_label = f"{body_type.replace('_', ' ').title()} | {model_data.get('size', 'M')}"
    add_text(draw, size_label, 24, h - 45, size=18, color=(180, 180, 200))

    # FitView AI watermark
    add_text(draw, "FitView AI", w - 160, 20, size=16, color=(120, 120, 140))

    return img


def create_product_image(product_data, palette):
    """Create a professional-looking product placeholder image."""
    w, h = 768, 1024
    bg_color = palette["bg"]
    accent = palette["accent"]
    label = palette["label"]
    name = product_data.get("name", "Product")
    category = product_data.get("category", "")
    price = product_data.get("price", 0)

    # Background
    bg_darker = tuple(max(0, c - 20) for c in bg_color)
    img = create_gradient(w, h, bg_color, bg_darker)
    draw = ImageDraw.Draw(img)

    # Central garment shape (stylized)
    cx, cy = w // 2, int(h * 0.42)
    garment_w = int(w * 0.55)
    garment_h = int(h * 0.45)

    # Draw a stylized garment silhouette
    if category in ("Kurtas", "Ethnic Wear"):
        # Long garment shape
        points = [
            (cx - garment_w // 3, cy - garment_h // 2),
            (cx + garment_w // 3, cy - garment_h // 2),
            (cx + garment_w // 2, cy + garment_h // 2),
            (cx - garment_w // 2, cy + garment_h // 2),
        ]
        draw.polygon(points, fill=accent)
        # Collar
        draw.ellipse(
            [cx - 25, cy - garment_h // 2 - 10, cx + 25, cy - garment_h // 2 + 20],
            fill=bg_color,
        )
    elif category in ("Shirts",):
        # Shirt shape with collar
        body_top = cy - garment_h // 2
        body_bot = cy + int(garment_h * 0.4)
        sleeve_w = int(garment_w * 0.25)

        # Body
        draw.rectangle(
            [cx - garment_w // 3, body_top, cx + garment_w // 3, body_bot],
            fill=accent,
        )
        # Sleeves
        draw.rectangle(
            [cx - garment_w // 3 - sleeve_w, body_top, cx - garment_w // 3, body_top + int(garment_h * 0.3)],
            fill=accent,
        )
        draw.rectangle(
            [cx + garment_w // 3, body_top, cx + garment_w // 3 + sleeve_w, body_top + int(garment_h * 0.3)],
            fill=accent,
        )
        # Collar V
        draw.polygon(
            [(cx - 20, body_top), (cx, body_top + 40), (cx + 20, body_top)],
            fill=bg_color,
        )
    elif category in ("Jeans",):
        # Pants shape
        pant_top = cy - garment_h // 3
        pant_bot = cy + garment_h // 2
        leg_w = int(garment_w * 0.22)
        gap = 10
        draw.rectangle([cx - gap - leg_w, pant_top, cx - gap, pant_bot], fill=accent)
        draw.rectangle([cx + gap, pant_top, cx + gap + leg_w, pant_bot], fill=accent)
        # Waistband
        draw.rectangle(
            [cx - gap - leg_w, pant_top, cx + gap + leg_w, pant_top + 20],
            fill=tuple(min(255, c + 30) for c in accent),
        )
    elif category in ("Sarees",):
        # Draped fabric shape
        for i in range(5):
            offset = i * 15
            color_var = tuple(min(255, max(0, c + random.randint(-20, 20))) for c in accent)
            draw.polygon(
                [
                    (cx - garment_w // 2 + offset, cy - garment_h // 3 + offset),
                    (cx + garment_w // 3 - offset, cy - garment_h // 2 + offset),
                    (cx + garment_w // 2 - offset, cy + garment_h // 2 - offset),
                    (cx - garment_w // 3 + offset, cy + garment_h // 3 - offset),
                ],
                fill=color_var,
            )
    elif category in ("Jackets",):
        # Jacket shape
        body_top = cy - garment_h // 2
        body_bot = cy + int(garment_h * 0.35)

        draw.rectangle(
            [cx - garment_w // 3, body_top, cx + garment_w // 3, body_bot],
            fill=accent,
        )
        # Lapels
        draw.polygon(
            [(cx - garment_w // 3, body_top), (cx - 10, body_top + 60), (cx - garment_w // 3, body_top + 80)],
            fill=tuple(max(0, c - 30) for c in accent),
        )
        draw.polygon(
            [(cx + garment_w // 3, body_top), (cx + 10, body_top + 60), (cx + garment_w // 3, body_top + 80)],
            fill=tuple(max(0, c - 30) for c in accent),
        )
    elif category in ("T-Shirts",):
        body_top = cy - garment_h // 3
        body_bot = cy + int(garment_h * 0.3)
        sleeve_h = int(garment_h * 0.15)

        draw.rectangle([cx - garment_w // 3, body_top, cx + garment_w // 3, body_bot], fill=accent)
        # Short sleeves
        draw.polygon(
            [
                (cx - garment_w // 3, body_top),
                (cx - garment_w // 2, body_top + sleeve_h),
                (cx - garment_w // 3, body_top + sleeve_h),
            ],
            fill=accent,
        )
        draw.polygon(
            [
                (cx + garment_w // 3, body_top),
                (cx + garment_w // 2, body_top + sleeve_h),
                (cx + garment_w // 3, body_top + sleeve_h),
            ],
            fill=accent,
        )
        # Neckline
        draw.ellipse([cx - 25, body_top - 5, cx + 25, body_top + 20], fill=bg_color)
    else:
        # Generic dress
        points = [
            (cx - garment_w // 3, cy - garment_h // 2),
            (cx + garment_w // 3, cy - garment_h // 2),
            (cx + garment_w // 2, cy + garment_h // 2),
            (cx - garment_w // 2, cy + garment_h // 2),
        ]
        draw.polygon(points, fill=accent)

    # Product name
    add_text(draw, name, 24, h - 120, size=26, color=(255, 255, 255))
    # Category
    add_text(draw, category, 24, h - 85, size=18, color=(200, 200, 220))
    # Price
    price_str = f"Rs. {price:,.0f}"
    add_text(draw, price_str, 24, h - 55, size=22, color=(255, 255, 255))
    # FitView AI
    add_text(draw, "FitView AI", w - 160, 20, size=16, color=(200, 200, 210))

    return img


def main():
    # Load seed data
    with open(os.path.join(DATA_DIR, "models.json"), "r") as f:
        models_data = json.load(f)
    with open(os.path.join(DATA_DIR, "products.json"), "r") as f:
        products_data = json.load(f)

    print("Generating 10 model images...")
    for model in models_data:
        mid = model["_id"]
        img = create_model_image(model)

        # Save original
        orig_path = os.path.join(MODELS_DIR, f"{mid}_original.webp")
        img.save(orig_path, "WEBP", quality=90)

        # Save thumbnail (300x300)
        thumb = img.copy()
        thumb.thumbnail((300, 300), Image.Resampling.LANCZOS)
        thumb_path = os.path.join(MODELS_DIR, f"{mid}_thumb.webp")
        thumb.save(thumb_path, "WEBP", quality=85)

        # Save web-optimized (1024x1024)
        web = img.copy()
        web.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        web_path = os.path.join(MODELS_DIR, f"{mid}_web.webp")
        web.save(web_path, "WEBP", quality=85)

        # Update image_url
        model["image_url"] = f"{BASE_URL}/uploads/models/{mid}_web.webp"
        print(f"  {mid}: {model['name']} -> {model['image_url']}")

    print("\nGenerating 10 product images...")
    for i, product in enumerate(products_data):
        pid = product["_id"]
        palette = PRODUCT_PALETTES[i % len(PRODUCT_PALETTES)]
        img = create_product_image(product, palette)

        # Save original
        orig_path = os.path.join(PRODUCTS_DIR, f"{pid}_original.webp")
        img.save(orig_path, "WEBP", quality=90)

        # Save thumbnail
        thumb = img.copy()
        thumb.thumbnail((300, 300), Image.Resampling.LANCZOS)
        thumb_path = os.path.join(PRODUCTS_DIR, f"{pid}_thumb.webp")
        thumb.save(thumb_path, "WEBP", quality=85)

        # Save web-optimized
        web = img.copy()
        web.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        web_path = os.path.join(PRODUCTS_DIR, f"{pid}_web.webp")
        web.save(web_path, "WEBP", quality=85)

        # Update images array
        product["images"] = [f"{BASE_URL}/uploads/products/{pid}_web.webp"]
        print(f"  {pid}: {product['name']} -> {product['images'][0]}")

    # Write updated JSON back
    with open(os.path.join(DATA_DIR, "models.json"), "w") as f:
        json.dump(models_data, f, indent=2)
    print(f"\nUpdated {DATA_DIR}/models.json with image URLs")

    with open(os.path.join(DATA_DIR, "products.json"), "w") as f:
        json.dump(products_data, f, indent=2)
    print(f"Updated {DATA_DIR}/products.json with image URLs")

    total_files = len(models_data) * 3 + len(products_data) * 3
    print(f"\nDone! Generated {total_files} image files ({len(models_data)} models + {len(products_data)} products x 3 sizes each)")


if __name__ == "__main__":
    main()
