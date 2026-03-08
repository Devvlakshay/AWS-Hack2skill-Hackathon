#!/usr/bin/env python3
"""Generate AI images for current models and products using Gemini API."""

import json
import os
import time

from google import genai
from google.genai import types

API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL_NAME = "gemini-2.0-flash-exp-image-generation"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "uploads", "models")
PRODUCTS_DIR = os.path.join(BASE_DIR, "uploads", "products")
DATA_DIR = os.path.join(BASE_DIR, "data")

client = genai.Client(api_key=API_KEY)


def generate_image(prompt: str, output_path: str, label: str) -> bool:
    for attempt in range(3):
        try:
            print(f"  Generating {label} (attempt {attempt + 1})...")
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE", "TEXT"]
                ),
            )
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    with open(output_path, "wb") as f:
                        f.write(part.inline_data.data)
                    size_kb = os.path.getsize(output_path) / 1024
                    print(f"  Saved: {os.path.basename(output_path)} ({size_kb:.1f} KB)")
                    return True
            print(f"  No image in response for {label}")
            if attempt < 2:
                time.sleep(4)
        except Exception as e:
            print(f"  Error: {e}")
            if attempt < 2:
                time.sleep(5)
    print(f"  FAILED: {label}")
    return False


# ── Model prompts based on current models.json ──
MODEL_PROMPTS = {
    "model001": (
        "Ananya",
        "Professional fashion photography of a beautiful young Indian woman named Ananya, "
        "age 24, slim body type, fair skin tone, size S, standing in a professional studio "
        "with clean neutral grey background, wearing a simple plain white fitted t-shirt and "
        "light blue jeans, full body shot from head to toe, natural elegant model pose, "
        "soft professional studio lighting, fashion e-commerce style, sharp focus, "
        "1024x1024 square format",
    ),
    "model002": (
        "Meera",
        "Professional fashion photography of a beautiful young Indian woman named Meera, "
        "age 26, average body type, medium wheat skin tone, size M, standing in a professional "
        "studio with clean neutral grey background, wearing a simple plain white kurta top and "
        "beige pants, full body shot from head to toe, confident graceful pose, "
        "soft professional studio lighting, fashion e-commerce style, sharp focus, "
        "1024x1024 square format",
    ),
    "model003": (
        "Riya",
        "Professional fashion photography of a beautiful young Indian woman named Riya, "
        "age 25, curvy body type, brown skin tone, size L, standing in a professional studio "
        "with clean neutral grey background, wearing a simple plain white blouse and dark jeans, "
        "full body shot from head to toe, confident stylish pose, "
        "soft professional studio lighting, fashion e-commerce style, sharp focus, "
        "1024x1024 square format",
    ),
    "model004": (
        "Arjun",
        "Professional fashion photography of a handsome young Indian man named Arjun, "
        "age 27, athletic muscular build, medium skin tone, size L, standing in a professional "
        "studio with clean neutral grey background, wearing a plain white crew neck t-shirt "
        "and dark navy jeans, full body shot from head to toe, strong confident pose, "
        "soft professional studio lighting, fashion e-commerce style, sharp focus, "
        "1024x1024 square format",
    ),
    "model005": (
        "Vikram",
        "Professional fashion photography of a handsome young Indian man named Vikram, "
        "age 28, average build, brown skin tone, size M, standing in a professional studio "
        "with clean neutral grey background, wearing a plain white button-down shirt and "
        "khaki chinos, full body shot from head to toe, relaxed casual pose, "
        "soft professional studio lighting, fashion e-commerce style, sharp focus, "
        "1024x1024 square format",
    ),
    "model006": (
        "Rohan",
        "Professional fashion photography of a handsome young Indian man named Rohan, "
        "age 25, slim tall build, fair light skin tone, size M, standing in a professional "
        "studio with clean neutral grey background, wearing a plain white polo shirt and "
        "dark grey trousers, full body shot from head to toe, stylish casual pose, "
        "soft professional studio lighting, fashion e-commerce style, sharp focus, "
        "1024x1024 square format",
    ),
}

# ── Product prompts based on current products.json ──
PRODUCT_PROMPTS = {
    "prod001": (
        "Royal Blue Silk Kurta",
        "Professional e-commerce product photography of a luxurious royal blue silk kurta "
        "for men, Indian ethnic wear with intricate gold zari embroidery work, mandarin collar, "
        "full-length sleeves, displayed flat-lay on a clean white background, "
        "premium fabric texture clearly visible, high quality studio lighting, "
        "sharp focus, 1024x1024 square format",
    ),
    "prod002": (
        "Classic White Formal Shirt",
        "Professional e-commerce product photography of a crisp classic white cotton formal shirt "
        "for men, slim fit, wrinkle-resistant premium cotton fabric, displayed flat-lay on a "
        "clean white background, collar and cuffs neatly arranged, "
        "high quality studio lighting, sharp focus, 1024x1024 square format",
    ),
    "prod003": (
        "Embroidered Anarkali Dress",
        "Professional e-commerce product photography of a stunning emerald green floor-length "
        "Anarkali dress for women, Indian ethnic wear with delicate gold thread embroidery, "
        "flared silhouette with fitted bodice, georgette fabric, "
        "displayed on a clean white background, high quality studio lighting, "
        "sharp focus, 1024x1024 square format",
    ),
    "prod004": (
        "Black Slim Fit Jeans",
        "Professional e-commerce product photography of modern black slim-fit denim jeans, "
        "mid-rise waist, 5-pocket styling, stretch denim fabric, "
        "displayed flat-lay on a clean white background, fabric texture visible, "
        "high quality studio lighting, sharp focus, 1024x1024 square format",
    ),
    "prod005": (
        "Red Banarasi Silk Saree",
        "Professional e-commerce product photography of a gorgeous red Banarasi silk saree "
        "with traditional gold zari motifs and border, authentic Indian handwoven textile, "
        "draped beautifully showing the pallu and border detail, "
        "displayed on a clean white background, high quality studio lighting, "
        "sharp focus, 1024x1024 square format",
    ),
    "prod006": (
        "Olive Graphic Oversized T-Shirt",
        "Professional e-commerce product photography of a trendy olive green oversized t-shirt "
        "with bold artistic graphic print on front, drop shoulder design, relaxed streetwear fit, "
        "thick 220 GSM cotton fabric, displayed flat-lay on a clean white background, "
        "high quality studio lighting, sharp focus, 1024x1024 square format",
    ),
    "prod007": (
        "Navy Quilted Bomber Jacket",
        "Professional e-commerce product photography of a stylish navy blue quilted bomber jacket, "
        "ribbed cuffs and hem, front zip closure, water-resistant outer shell, "
        "lightweight winter wear, displayed on a clean white background, "
        "high quality studio lighting, sharp focus, 1024x1024 square format",
    ),
    "prod008": (
        "White Chikankari Palazzo Set",
        "Professional e-commerce product photography of an elegant white Lucknowi Chikankari "
        "embroidered kurta with matching palazzo pants set for women, pure cotton fabric with "
        "intricate hand-embroidered floral patterns, Indian ethnic wear, "
        "displayed on a clean white background, high quality studio lighting, "
        "sharp focus, 1024x1024 square format",
    ),
}


def main():
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(PRODUCTS_DIR, exist_ok=True)

    total_models = len(MODEL_PROMPTS)
    total_products = len(PRODUCT_PROMPTS)

    print("=" * 60)
    print(f"GENERATING {total_models} MODEL IMAGES WITH GEMINI AI")
    print("=" * 60)

    model_ok = 0
    for i, (model_id, (name, prompt)) in enumerate(MODEL_PROMPTS.items(), 1):
        print(f"\n[{i}/{total_models}] {name} ({model_id})")
        path = os.path.join(MODELS_DIR, f"{model_id}_web.png")
        if generate_image(prompt, path, name):
            model_ok += 1
        time.sleep(3)

    print("\n" + "=" * 60)
    print(f"GENERATING {total_products} PRODUCT IMAGES WITH GEMINI AI")
    print("=" * 60)

    prod_ok = 0
    for i, (prod_id, (name, prompt)) in enumerate(PRODUCT_PROMPTS.items(), 1):
        print(f"\n[{i}/{total_products}] {name} ({prod_id})")
        path = os.path.join(PRODUCTS_DIR, f"{prod_id}_web.png")
        if generate_image(prompt, path, name):
            prod_ok += 1
        time.sleep(3)

    print("\n" + "=" * 60)
    print(f"DONE! Models: {model_ok}/{total_models}, Products: {prod_ok}/{total_products}")
    print("=" * 60)


if __name__ == "__main__":
    main()
