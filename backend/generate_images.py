"""
Generate unique placeholder images for FitView AI models and products.
Uses Pillow to create visually distinct, professional-looking placeholder images.
"""

import json
import math
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(__file__).parent
MODELS_DIR = BASE_DIR / "uploads" / "models"
PRODUCTS_DIR = BASE_DIR / "uploads" / "products"
DATA_DIR = BASE_DIR / "data"

SIZE = 1024


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def darken(color: tuple[int, int, int], factor: float = 0.7) -> tuple[int, int, int]:
    return tuple(max(0, int(c * factor)) for c in color)


def lighten(color: tuple[int, int, int], factor: float = 0.3) -> tuple[int, int, int]:
    return tuple(min(255, int(c + (255 - c) * factor)) for c in color)


def get_font(size: int) -> ImageFont.FreeTypeFont:
    """Try to load a nice font, fall back to default."""
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/ubuntu/Ubuntu-Bold.ttf",
        "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            return ImageFont.truetype(fp, size)
    return ImageFont.load_default()


def get_light_font(size: int) -> ImageFont.FreeTypeFont:
    """Try to load a regular weight font."""
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/ubuntu/Ubuntu-Regular.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            return ImageFont.truetype(fp, size)
    return ImageFont.load_default()


def draw_gradient(draw: ImageDraw.Draw, width: int, height: int,
                  color_top: tuple, color_bottom: tuple):
    """Draw a vertical gradient."""
    for y in range(height):
        ratio = y / height
        r = int(color_top[0] + (color_bottom[0] - color_top[0]) * ratio)
        g = int(color_top[1] + (color_bottom[1] - color_top[1]) * ratio)
        b = int(color_top[2] + (color_bottom[2] - color_top[2]) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))


def draw_decorative_circles(draw: ImageDraw.Draw, color: tuple, size: int):
    """Draw subtle decorative circles in corners."""
    light = lighten(color, 0.4)
    # Top-left
    draw.ellipse([-40, -40, 120, 120], fill=None, outline=light, width=2)
    draw.ellipse([-20, -20, 80, 80], fill=None, outline=light, width=1)
    # Top-right
    draw.ellipse([size - 120, -40, size + 40, 120], fill=None, outline=light, width=2)
    # Bottom-left
    draw.ellipse([-40, size - 120, 120, size + 40], fill=None, outline=light, width=2)
    # Bottom-right
    draw.ellipse([size - 120, size - 120, size + 40, size + 40], fill=None, outline=light, width=2)


def generate_model_image(
    model_id: str,
    name: str,
    gender: str,
    skin_tone: str,
    body_type: str,
    bg_hex: str,
    accent_hex: str,
):
    """Generate a model placeholder image."""
    bg_color = hex_to_rgb(bg_hex)
    accent = hex_to_rgb(accent_hex)
    img = Image.new("RGB", (SIZE, SIZE), bg_color)
    draw = ImageDraw.Draw(img)

    # Gradient background
    bg_dark = darken(bg_color, 0.85)
    draw_gradient(draw, SIZE, SIZE, bg_color, bg_dark)

    # Decorative elements
    draw_decorative_circles(draw, bg_color, SIZE)

    # Border frame
    border_color = darken(bg_color, 0.6)
    draw.rectangle([20, 20, SIZE - 20, SIZE - 20], outline=border_color, width=3)
    draw.rectangle([30, 30, SIZE - 30, SIZE - 30], outline=lighten(bg_color, 0.2), width=1)

    # Silhouette colors
    silhouette_color = darken(bg_color, 0.55)
    silhouette_highlight = darken(bg_color, 0.65)

    cx = SIZE // 2

    if gender == "female":
        # Head
        head_r = 62
        head_cy = 220
        draw.ellipse(
            [cx - head_r, head_cy - head_r, cx + head_r, head_cy + head_r],
            fill=silhouette_color,
        )
        # Hair
        draw.arc(
            [cx - head_r - 8, head_cy - head_r - 15, cx + head_r + 8, head_cy + head_r + 10],
            180, 360, fill=darken(silhouette_color, 0.8), width=12,
        )
        # Neck
        draw.rectangle([cx - 18, head_cy + head_r, cx + 18, head_cy + head_r + 40],
                       fill=silhouette_color)
        # Shoulders + body (hourglass)
        shoulder_y = head_cy + head_r + 40
        # Shoulders
        draw.polygon([
            (cx - 120, shoulder_y + 20),
            (cx - 18, shoulder_y),
            (cx + 18, shoulder_y),
            (cx + 120, shoulder_y + 20),
            (cx + 110, shoulder_y + 50),
            (cx - 110, shoulder_y + 50),
        ], fill=silhouette_color)
        # Torso (hourglass)
        draw.polygon([
            (cx - 110, shoulder_y + 50),
            (cx - 80, shoulder_y + 180),
            (cx - 95, shoulder_y + 300),
            (cx + 95, shoulder_y + 300),
            (cx + 80, shoulder_y + 180),
            (cx + 110, shoulder_y + 50),
        ], fill=silhouette_color)
        # Skirt / lower body
        draw.polygon([
            (cx - 95, shoulder_y + 300),
            (cx - 130, shoulder_y + 480),
            (cx + 130, shoulder_y + 480),
            (cx + 95, shoulder_y + 300),
        ], fill=silhouette_highlight)
        # Accent line at waist
        draw.line([(cx - 82, shoulder_y + 178), (cx + 82, shoulder_y + 178)],
                  fill=accent, width=3)
    else:
        # Male silhouette
        head_r = 65
        head_cy = 210
        draw.ellipse(
            [cx - head_r, head_cy - head_r, cx + head_r, head_cy + head_r],
            fill=silhouette_color,
        )
        # Neck
        draw.rectangle([cx - 22, head_cy + head_r, cx + 22, head_cy + head_r + 35],
                       fill=silhouette_color)
        # Shoulders + torso (broader, straighter)
        shoulder_y = head_cy + head_r + 35
        draw.polygon([
            (cx - 140, shoulder_y + 25),
            (cx - 22, shoulder_y),
            (cx + 22, shoulder_y),
            (cx + 140, shoulder_y + 25),
            (cx + 130, shoulder_y + 55),
            (cx - 130, shoulder_y + 55),
        ], fill=silhouette_color)
        # Torso (rectangular)
        draw.polygon([
            (cx - 130, shoulder_y + 55),
            (cx - 110, shoulder_y + 300),
            (cx + 110, shoulder_y + 300),
            (cx + 130, shoulder_y + 55),
        ], fill=silhouette_color)
        # Legs
        draw.polygon([
            (cx - 110, shoulder_y + 300),
            (cx - 100, shoulder_y + 490),
            (cx - 15, shoulder_y + 490),
            (cx - 20, shoulder_y + 300),
        ], fill=silhouette_highlight)
        draw.polygon([
            (cx + 20, shoulder_y + 300),
            (cx + 15, shoulder_y + 490),
            (cx + 100, shoulder_y + 490),
            (cx + 110, shoulder_y + 300),
        ], fill=silhouette_highlight)
        # Accent line at chest
        draw.line([(cx - 50, shoulder_y + 80), (cx + 50, shoulder_y + 80)],
                  fill=accent, width=3)

    # "FitView AI" top watermark
    wm_font = get_light_font(22)
    draw.text((SIZE // 2, 50), "FITVIEW AI", fill=darken(bg_color, 0.5),
              font=wm_font, anchor="mm")

    # Model name - large
    name_font = get_font(56)
    text_y = SIZE - 140
    # Text shadow
    draw.text((cx + 2, text_y + 2), name, fill=darken(bg_color, 0.4),
              font=name_font, anchor="mm")
    draw.text((cx, text_y), name, fill=darken(bg_color, 0.2),
              font=name_font, anchor="mm")

    # Subtitle
    sub_font = get_light_font(28)
    subtitle = f"{gender.capitalize()}  |  {body_type.replace('_', ' ').title()}  |  {skin_tone.capitalize()}"
    draw.text((cx, text_y + 50), subtitle, fill=darken(bg_color, 0.35),
              font=sub_font, anchor="mm")

    # Accent bar at bottom
    draw.rectangle([80, SIZE - 55, SIZE - 80, SIZE - 50], fill=accent)

    filepath = MODELS_DIR / f"{model_id}_web.png"
    img.save(filepath, "PNG")
    print(f"  Created: {filepath.name}")


def draw_garment_kurta(draw: ImageDraw.Draw, cx: int, color: tuple, dark: tuple):
    """Draw a kurta silhouette."""
    # Main body
    draw.polygon([
        (cx - 120, 200), (cx - 140, 220),  # left shoulder
        (cx - 200, 320),  # left sleeve end
        (cx - 140, 310),  # sleeve join
        (cx - 130, 650),  # left hem
        (cx + 130, 650),  # right hem
        (cx + 140, 310),
        (cx + 200, 320),
        (cx + 140, 220),
        (cx + 120, 200),
    ], fill=color, outline=dark, width=2)
    # Neckline
    draw.arc([cx - 35, 185, cx + 35, 240], 0, 180, fill=dark, width=3)
    # Center line
    draw.line([(cx, 240), (cx, 640)], fill=dark, width=2)
    # Decorative buttons
    for y in range(270, 500, 50):
        draw.ellipse([cx - 5, y - 5, cx + 5, y + 5], fill=dark)


def draw_garment_sherwani(draw: ImageDraw.Draw, cx: int, color: tuple, dark: tuple):
    """Draw a sherwani silhouette."""
    gold = (212, 175, 55)
    # Long body
    draw.polygon([
        (cx - 130, 180), (cx - 150, 200),
        (cx - 210, 300), (cx - 150, 290),
        (cx - 140, 700), (cx + 140, 700),
        (cx + 150, 290), (cx + 210, 300),
        (cx + 150, 200), (cx + 130, 180),
    ], fill=color, outline=dark, width=2)
    # Mandarin collar
    draw.polygon([
        (cx - 30, 170), (cx, 160), (cx + 30, 170),
        (cx + 25, 200), (cx - 25, 200),
    ], fill=darken(color, 0.85), outline=dark, width=2)
    # Diagonal overlap
    draw.line([(cx - 10, 200), (cx + 40, 700)], fill=gold, width=3)
    # Gold embroidery accents
    for y in range(230, 400, 35):
        draw.line([(cx + 15, y), (cx + 55, y + 10)], fill=gold, width=2)


def draw_garment_dupatta_set(draw: ImageDraw.Draw, cx: int, color: tuple, dark: tuple):
    """Draw a dupatta set silhouette."""
    # Kurta body
    draw.polygon([
        (cx - 100, 220), (cx - 120, 240),
        (cx - 170, 330), (cx - 120, 320),
        (cx - 110, 580), (cx + 110, 580),
        (cx + 120, 320), (cx + 170, 330),
        (cx + 120, 240), (cx + 100, 220),
    ], fill=color, outline=dark, width=2)
    # Dupatta draped across
    dupatta_color = lighten(color, 0.3)
    draw.polygon([
        (cx - 180, 200), (cx - 160, 190),
        (cx + 100, 250), (cx + 180, 350),
        (cx + 200, 500), (cx + 170, 510),
        (cx + 80, 380), (cx - 100, 270),
        (cx - 190, 220),
    ], fill=dupatta_color, outline=darken(dupatta_color, 0.8), width=2)
    # Neckline
    draw.arc([cx - 30, 205, cx + 30, 250], 0, 180, fill=dark, width=3)


def draw_garment_joggers(draw: ImageDraw.Draw, cx: int, color: tuple, dark: tuple):
    """Draw joggers silhouette."""
    # Waistband
    draw.rectangle([cx - 120, 250, cx + 120, 285], fill=darken(color, 0.85),
                    outline=dark, width=2)
    # Drawstring
    draw.arc([cx - 15, 255, cx + 15, 280], 180, 360, fill=dark, width=2)
    # Left leg
    draw.polygon([
        (cx - 120, 285), (cx - 5, 285),
        (cx - 20, 660), (cx - 70, 670),
        (cx - 130, 660),
    ], fill=color, outline=dark, width=2)
    # Right leg
    draw.polygon([
        (cx + 5, 285), (cx + 120, 285),
        (cx + 130, 660), (cx + 70, 670),
        (cx + 20, 660),
    ], fill=color, outline=dark, width=2)
    # Cuffs
    draw.rectangle([cx - 130, 650, cx - 20, 670], fill=darken(color, 0.85),
                    outline=dark, width=1)
    draw.rectangle([cx + 20, 650, cx + 130, 670], fill=darken(color, 0.85),
                    outline=dark, width=1)
    # Side stripe
    draw.line([(cx - 120, 285), (cx - 128, 650)], fill=lighten(color, 0.3), width=4)
    draw.line([(cx + 120, 285), (cx + 128, 650)], fill=lighten(color, 0.3), width=4)


def draw_garment_saree(draw: ImageDraw.Draw, cx: int, color: tuple, dark: tuple):
    """Draw a saree silhouette with drape."""
    gold = (212, 175, 55)
    # Main drape body
    draw.polygon([
        (cx - 100, 200), (cx + 60, 180),
        (cx + 150, 200), (cx + 180, 250),
        (cx + 120, 650), (cx - 80, 680),
        (cx - 130, 650), (cx - 140, 300),
    ], fill=color, outline=dark, width=2)
    # Pallu (draped over shoulder)
    pallu_color = lighten(color, 0.15)
    draw.polygon([
        (cx - 160, 180), (cx - 80, 170),
        (cx + 30, 200), (cx + 60, 350),
        (cx - 20, 400), (cx - 140, 350),
        (cx - 180, 250),
    ], fill=pallu_color, outline=dark, width=2)
    # Gold border
    draw.line([(cx - 130, 645), (cx + 120, 645)], fill=gold, width=5)
    draw.line([(cx - 130, 655), (cx + 120, 655)], fill=gold, width=3)
    # Border on pallu
    draw.line([(cx - 160, 185), (cx - 175, 245)], fill=gold, width=4)


def draw_garment_pathani(draw: ImageDraw.Draw, cx: int, color: tuple, dark: tuple):
    """Draw a pathani suit silhouette."""
    # Long kurta
    draw.polygon([
        (cx - 120, 190), (cx - 140, 210),
        (cx - 190, 300), (cx - 140, 290),
        (cx - 135, 680), (cx + 135, 680),
        (cx + 140, 290), (cx + 190, 300),
        (cx + 140, 210), (cx + 120, 190),
    ], fill=color, outline=dark, width=2)
    # Round neckline
    draw.ellipse([cx - 35, 175, cx + 35, 220], fill=lighten(color, 0.3),
                 outline=dark, width=2)
    # Center placket
    draw.rectangle([cx - 8, 220, cx + 8, 450], fill=darken(color, 0.9),
                    outline=dark, width=1)
    # Embroidery on yoke
    for angle in range(0, 360, 30):
        ex = cx + int(50 * math.cos(math.radians(angle)))
        ey = 260 + int(30 * math.sin(math.radians(angle)))
        draw.ellipse([ex - 3, ey - 3, ex + 3, ey + 3],
                     fill=lighten(color, 0.4))


def draw_garment_dress(draw: ImageDraw.Draw, cx: int, color: tuple, dark: tuple):
    """Draw a wrap dress silhouette."""
    # V-neck bodice + flared skirt
    draw.polygon([
        (cx - 90, 200),  # left shoulder
        (cx, 300),  # V-neck point
        (cx + 90, 200),  # right shoulder
        (cx + 100, 210),
        (cx + 110, 350),  # waist right
        (cx + 160, 680),  # right hem
        (cx - 160, 680),  # left hem
        (cx - 110, 350),  # waist left
        (cx - 100, 210),
    ], fill=color, outline=dark, width=2)
    # Wrap line
    draw.line([(cx, 300), (cx - 100, 680)], fill=dark, width=3)
    # Belt/tie at waist
    draw.rectangle([cx - 115, 345, cx + 115, 360], fill=darken(color, 0.8),
                    outline=dark, width=1)
    # Flutter sleeve left
    draw.polygon([
        (cx - 90, 200), (cx - 150, 260), (cx - 110, 270), (cx - 100, 210),
    ], fill=lighten(color, 0.2), outline=dark, width=1)
    # Flutter sleeve right
    draw.polygon([
        (cx + 90, 200), (cx + 150, 260), (cx + 110, 270), (cx + 100, 210),
    ], fill=lighten(color, 0.2), outline=dark, width=1)


def draw_garment_shirt(draw: ImageDraw.Draw, cx: int, color: tuple, dark: tuple):
    """Draw a formal shirt silhouette."""
    # Body
    draw.polygon([
        (cx - 110, 200), (cx - 130, 220),
        (cx - 190, 310), (cx - 130, 300),
        (cx - 120, 560), (cx + 120, 560),
        (cx + 130, 300), (cx + 190, 310),
        (cx + 130, 220), (cx + 110, 200),
    ], fill=color, outline=dark, width=2)
    # Collar
    draw.polygon([
        (cx - 50, 190), (cx - 70, 215), (cx - 30, 235), (cx, 210),
    ], fill=lighten(color, 0.2), outline=dark, width=2)
    draw.polygon([
        (cx + 50, 190), (cx + 70, 215), (cx + 30, 235), (cx, 210),
    ], fill=lighten(color, 0.2), outline=dark, width=2)
    # Button placket
    draw.rectangle([cx - 6, 210, cx + 6, 555], fill=darken(color, 0.9),
                    outline=dark, width=1)
    # Buttons
    for y in range(240, 540, 50):
        draw.ellipse([cx - 5, y - 5, cx + 5, y + 5], fill=(240, 240, 240),
                     outline=dark, width=1)
    # Pocket
    draw.rectangle([cx + 30, 270, cx + 80, 320], outline=dark, width=1)


def draw_garment_kurti(draw: ImageDraw.Draw, cx: int, color: tuple, dark: tuple):
    """Draw a kurti silhouette."""
    # A-line body
    draw.polygon([
        (cx - 90, 210), (cx - 110, 230),
        (cx - 160, 310), (cx - 110, 300),
        (cx - 140, 620), (cx + 140, 620),
        (cx + 110, 300), (cx + 160, 310),
        (cx + 110, 230), (cx + 90, 210),
    ], fill=color, outline=dark, width=2)
    # Mandarin collar
    draw.rectangle([cx - 25, 198, cx + 25, 220], fill=darken(color, 0.85),
                    outline=dark, width=2)
    # Side slits
    draw.line([(cx - 138, 560), (cx - 140, 620)], fill=lighten(color, 0.3), width=3)
    draw.line([(cx + 138, 560), (cx + 140, 620)], fill=lighten(color, 0.3), width=3)
    # Bandhani dots pattern
    for row in range(280, 580, 40):
        offset = 20 if (row // 40) % 2 else 0
        for col in range(cx - 100 + offset, cx + 100, 40):
            draw.ellipse([col - 4, row - 4, col + 4, row + 4],
                         fill=lighten(color, 0.3))


def draw_garment_overcoat(draw: ImageDraw.Draw, cx: int, color: tuple, dark: tuple):
    """Draw an overcoat silhouette."""
    # Long coat body
    draw.polygon([
        (cx - 130, 180), (cx - 150, 200),
        (cx - 200, 300), (cx - 150, 290),
        (cx - 150, 720), (cx + 150, 720),
        (cx + 150, 290), (cx + 200, 300),
        (cx + 150, 200), (cx + 130, 180),
    ], fill=color, outline=dark, width=2)
    # Lapels
    draw.polygon([
        (cx - 60, 180), (cx - 80, 200), (cx - 80, 310),
        (cx - 20, 290), (cx, 200),
    ], fill=lighten(color, 0.15), outline=dark, width=2)
    draw.polygon([
        (cx + 60, 180), (cx + 80, 200), (cx + 80, 310),
        (cx + 20, 290), (cx, 200),
    ], fill=lighten(color, 0.15), outline=dark, width=2)
    # Double-breasted buttons
    for y in range(320, 520, 60):
        draw.ellipse([cx - 45, y - 6, cx - 33, y + 6], fill=(180, 160, 120),
                     outline=dark, width=1)
        draw.ellipse([cx + 33, y - 6, cx + 45, y + 6], fill=(180, 160, 120),
                     outline=dark, width=1)
    # Pockets
    draw.line([(cx - 120, 450), (cx - 40, 450)], fill=dark, width=2)
    draw.line([(cx + 40, 450), (cx + 120, 450)], fill=dark, width=2)


GARMENT_DRAWERS = {
    "kurta": draw_garment_kurta,
    "sherwani": draw_garment_sherwani,
    "dupatta_set": draw_garment_dupatta_set,
    "joggers": draw_garment_joggers,
    "saree": draw_garment_saree,
    "pathani": draw_garment_pathani,
    "dress": draw_garment_dress,
    "shirt": draw_garment_shirt,
    "kurti": draw_garment_kurti,
    "overcoat": draw_garment_overcoat,
}


def generate_product_image(
    prod_id: str,
    name: str,
    category: str,
    color_hex: str,
    price: str,
):
    """Generate a product placeholder image."""
    garment_color = hex_to_rgb(color_hex)
    dark = darken(garment_color, 0.7)

    # Light background
    bg = (250, 248, 245)
    img = Image.new("RGB", (SIZE, SIZE), bg)
    draw = ImageDraw.Draw(img)

    # Subtle background pattern (diagonal lines)
    for i in range(-SIZE, SIZE * 2, 40):
        draw.line([(i, 0), (i + SIZE, SIZE)], fill=(245, 242, 238), width=1)

    # Light shadow behind garment
    shadow_color = (235, 232, 228)
    draw.ellipse([SIZE // 2 - 200, 600, SIZE // 2 + 200, 720], fill=shadow_color)

    # Draw the garment
    cx = SIZE // 2
    drawer = GARMENT_DRAWERS.get(category, draw_garment_kurta)
    drawer(draw, cx, garment_color, dark)

    # Product name at bottom
    name_font = get_font(42)
    text_y = SIZE - 130
    draw.text((cx, text_y), name, fill=(60, 60, 60), font=name_font, anchor="mm")

    # Price tag in top-right corner
    price_font = get_font(28)
    tag_w, tag_h = 140, 50
    tag_x, tag_y = SIZE - 60 - tag_w, 50
    # Tag background
    draw.rounded_rectangle(
        [tag_x, tag_y, tag_x + tag_w, tag_y + tag_h],
        radius=8,
        fill=garment_color,
        outline=dark,
        width=2,
    )
    # Price text (white or dark depending on brightness)
    brightness = sum(garment_color) / 3
    price_text_color = (255, 255, 255) if brightness < 180 else (40, 40, 40)
    draw.text((tag_x + tag_w // 2, tag_y + tag_h // 2), price,
              fill=price_text_color, font=price_font, anchor="mm")

    # FitView AI watermark bottom-right
    wm_font = get_light_font(18)
    draw.text((SIZE - 50, SIZE - 40), "FitView AI", fill=(180, 180, 180),
              font=wm_font, anchor="mm")

    # Subtle border
    draw.rectangle([15, 15, SIZE - 15, SIZE - 15], outline=(220, 215, 210), width=2)

    # Category label top-left
    cat_font = get_light_font(22)
    draw.rounded_rectangle(
        [50, 55, 50 + len(category) * 13 + 20, 90],
        radius=6,
        fill=(240, 237, 233),
        outline=(210, 205, 200),
        width=1,
    )
    draw.text((60, 60), category.upper(), fill=(120, 120, 120), font=cat_font)

    filepath = PRODUCTS_DIR / f"{prod_id}_web.png"
    img.save(filepath, "PNG")
    print(f"  Created: {filepath.name}")


def update_json_files():
    """Update models.json and products.json with correct image URLs."""
    # Update models.json
    models_path = DATA_DIR / "models.json"
    with open(models_path) as f:
        models = json.load(f)

    model_ids = {f"model_com_{i:03d}" for i in range(1, 11)}
    for model in models:
        if model["_id"] in model_ids:
            model["image_url"] = f"http://localhost:8000/uploads/models/{model['_id']}_web.png"

    with open(models_path, "w") as f:
        json.dump(models, f, indent=2)
    print("  Updated models.json")

    # Update products.json
    products_path = DATA_DIR / "products.json"
    with open(products_path) as f:
        products = json.load(f)

    prod_ids = {f"prod_new_{i:03d}" for i in range(1, 11)}
    for product in products:
        if product["_id"] in prod_ids:
            new_url = f"http://localhost:8000/uploads/products/{product['_id']}_web.png"
            product["images"] = [new_url]

    with open(products_path, "w") as f:
        json.dump(products, f, indent=2)
    print("  Updated products.json")


def main():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    PRODUCTS_DIR.mkdir(parents=True, exist_ok=True)

    # ── Model definitions ──
    models = [
        ("model_com_001", "Ishita", "female", "medium", "curvy", "#F5D0C5", "#C4887A"),
        ("model_com_002", "Aditya", "male", "brown", "athletic", "#C5D5E8", "#7A9BBF"),
        ("model_com_003", "Tanvi", "female", "fair", "slim", "#E0D0F0", "#A890C5"),
        ("model_com_004", "Rahul", "male", "medium", "average", "#D5E8D0", "#8BBF80"),
        ("model_com_005", "Zara", "female", "olive", "average", "#F0E0C0", "#C5A870"),
        ("model_com_006", "Vivek", "male", "fair", "slim", "#C0E8E0", "#70BFB0"),
        ("model_com_007", "Pooja", "female", "brown", "plus_size", "#F0C5D0", "#C57A8A"),
        ("model_com_008", "Manish", "male", "dark", "athletic", "#D0D5E8", "#8A90BF"),
        ("model_com_009", "Divya", "female", "medium", "slim", "#E8D5C0", "#BFA870"),
        ("model_com_010", "Sameer", "male", "olive", "average", "#C5E0D0", "#70BF9A"),
    ]

    print("Generating model images...")
    for m in models:
        generate_model_image(*m)

    # ── Product definitions ──
    products = [
        ("prod_new_001", "Rust Linen Kurta", "kurta", "#C4622D", "Rs.2999"),
        ("prod_new_002", "Emerald Velvet Sherwani", "sherwani", "#2E8B57", "Rs.15999"),
        ("prod_new_003", "Pink Silk Dupatta Set", "dupatta_set", "#FFB6C1", "Rs.5499"),
        ("prod_new_004", "Stone Grey Joggers", "joggers", "#808080", "Rs.1599"),
        ("prod_new_005", "Ivory Chanderi Saree", "saree", "#FFFFF0", "Rs.8999"),
        ("prod_new_006", "Forest Green Pathani Suit", "pathani", "#228B22", "Rs.3999"),
        ("prod_new_007", "Coral Wrap Dress", "dress", "#FF7F50", "Rs.2799"),
        ("prod_new_008", "Steel Blue Oxford Shirt", "shirt", "#4682B4", "Rs.2199"),
        ("prod_new_009", "Magenta Bandhani Kurti", "kurti", "#C71585", "Rs.1799"),
        ("prod_new_010", "Charcoal Wool Overcoat", "overcoat", "#36454F", "Rs.9999"),
    ]

    print("\nGenerating product images...")
    for p in products:
        generate_product_image(*p)

    print("\nUpdating JSON data files...")
    update_json_files()

    print("\nDone! All 20 images generated successfully.")


if __name__ == "__main__":
    main()
