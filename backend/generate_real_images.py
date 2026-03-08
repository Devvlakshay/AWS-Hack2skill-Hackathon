#!/usr/bin/env python3
"""Generate realistic fashion model and product clothing images using Gemini API."""

import os
import time
import base64
from google import genai
from google.genai import types

API_KEY = "your-gemini-api-key"
MODEL_NAME = "gemini-2.0-flash-exp-image-generation"

BASE_DIR = "/home/lakshya/Desktop/AiForBharat/backend"
MODELS_DIR = os.path.join(BASE_DIR, "uploads", "models")
PRODUCTS_DIR = os.path.join(BASE_DIR, "uploads", "products")

client = genai.Client(api_key=API_KEY)

MODEL_IMAGES = [
    ("model_com_001_web.png", "Professional fashion photography of an Indian woman named Ishita, age 25, curvy body type, medium skin tone, standing in a studio with neutral background, wearing a simple white t-shirt and jeans, full body shot, fashion model pose, high quality studio lighting, 1024x1024"),
    ("model_com_002_web.png", "Professional fashion photography of an Indian man named Aditya, age 27, athletic muscular build, brown skin tone, standing in a studio with neutral background, wearing a plain white t-shirt and dark pants, full body shot, confident pose, high quality studio lighting, 1024x1024"),
    ("model_com_003_web.png", "Professional fashion photography of an Indian woman named Tanvi, age 23, slim petite body type, fair light skin tone, standing in a studio with neutral background, wearing a simple white top and jeans, full body shot, elegant pose, high quality studio lighting, 1024x1024"),
    ("model_com_004_web.png", "Professional fashion photography of an Indian man named Rahul, age 28, average build, medium skin tone, standing in a studio with neutral background, wearing a basic white shirt and trousers, full body shot, relaxed pose, high quality studio lighting, 1024x1024"),
    ("model_com_005_web.png", "Professional fashion photography of an Indian woman named Zara, age 24, average build, olive skin tone, standing in a studio with neutral background, wearing a simple white kurta top and jeans, full body shot, graceful pose, high quality studio lighting, 1024x1024"),
    ("model_com_006_web.png", "Professional fashion photography of an Indian man named Vivek, age 26, slim tall build, fair light skin tone, standing in a studio with neutral background, wearing a plain white t-shirt and chinos, full body shot, casual pose, high quality studio lighting, 1024x1024"),
    ("model_com_007_web.png", "Professional fashion photography of an Indian woman named Pooja, age 30, plus size curvy body type, brown skin tone, standing in a studio with neutral background, wearing a comfortable white top and pants, full body shot, confident pose, high quality studio lighting, 1024x1024"),
    ("model_com_008_web.png", "Professional fashion photography of an Indian man named Manish, age 29, athletic muscular build, dark skin tone, standing in a studio with neutral background, wearing a white polo shirt and dark jeans, full body shot, strong pose, high quality studio lighting, 1024x1024"),
    ("model_com_009_web.png", "Professional fashion photography of an Indian woman named Divya, age 22, slim build, medium skin tone, standing in a studio with neutral background, wearing a simple white blouse and skirt, full body shot, youthful pose, high quality studio lighting, 1024x1024"),
    ("model_com_010_web.png", "Professional fashion photography of an Indian man named Sameer, age 27, average build, olive skin tone, standing in a studio with neutral background, wearing a basic white kurta and pajama, full body shot, traditional pose, high quality studio lighting, 1024x1024"),
]

PRODUCT_IMAGES = [
    ("prod_new_001_web.png", "Professional product photography of a rust orange linen kurta for men, displayed on a clean white background, neatly folded or laid flat, Indian ethnic wear, high quality studio shot, e-commerce product photo, detailed fabric texture visible"),
    ("prod_new_002_web.png", "Professional product photography of an emerald green velvet sherwani for men, displayed on a clean white background, ornate Indian wedding wear with golden embroidery, high quality studio shot, e-commerce product photo"),
    ("prod_new_003_web.png", "Professional product photography of a pink silk dupatta set for women, displayed on a clean white background, traditional Indian ethnic wear with intricate border work, high quality studio shot, e-commerce product photo"),
    ("prod_new_004_web.png", "Professional product photography of stone grey joggers pants, displayed on a clean white background, modern casual athleisure wear, comfortable fit, high quality studio shot, e-commerce product photo"),
    ("prod_new_005_web.png", "Professional product photography of an ivory white chanderi saree with golden zari border, displayed on a clean white background, elegant Indian traditional wear, draped beautifully, high quality studio shot, e-commerce product photo"),
    ("prod_new_006_web.png", "Professional product photography of a forest green pathani suit for men, displayed on a clean white background, traditional Indian men's wear with matching pants, high quality studio shot, e-commerce product photo"),
    ("prod_new_007_web.png", "Professional product photography of a coral orange wrap dress for women, displayed on a clean white background, modern western fashion, flowing fabric, high quality studio shot, e-commerce product photo"),
    ("prod_new_008_web.png", "Professional product photography of a steel blue oxford formal shirt for men, displayed on a clean white background, crisp cotton dress shirt, neatly folded, high quality studio shot, e-commerce product photo"),
    ("prod_new_009_web.png", "Professional product photography of a magenta bandhani kurti for women, displayed on a clean white background, traditional Indian tie-dye pattern, colorful ethnic wear, high quality studio shot, e-commerce product photo"),
    ("prod_new_010_web.png", "Professional product photography of a charcoal grey wool overcoat for men, displayed on a clean white background, premium winter wear, tailored fit, high quality studio shot, e-commerce product photo"),
]


def generate_image(prompt: str, output_path: str, label: str) -> bool:
    """Generate a single image using Gemini API and save it."""
    for attempt in range(2):
        try:
            print(f"  Generating {label} (attempt {attempt + 1})...")
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE", "TEXT"]
                )
            )
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    image_bytes = part.inline_data.data
                    with open(output_path, "wb") as f:
                        f.write(image_bytes)
                    size_kb = os.path.getsize(output_path) / 1024
                    print(f"  Saved: {output_path} ({size_kb:.1f} KB)")
                    return True
            print(f"  Warning: No image data in response for {label}")
            if attempt == 0:
                time.sleep(3)
        except Exception as e:
            print(f"  Error generating {label}: {e}")
            if attempt == 0:
                print("  Retrying in 5 seconds...")
                time.sleep(5)
    print(f"  SKIPPED: {label} (failed after 2 attempts)")
    return False


def main():
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(PRODUCTS_DIR, exist_ok=True)

    print("=" * 60)
    print("GENERATING FASHION MODEL IMAGES")
    print("=" * 60)
    model_success = 0
    for i, (filename, prompt) in enumerate(MODEL_IMAGES, 1):
        print(f"\n[{i}/10] {filename}")
        output_path = os.path.join(MODELS_DIR, filename)
        if generate_image(prompt, output_path, filename):
            model_success += 1
        time.sleep(3)

    print("\n" + "=" * 60)
    print("GENERATING PRODUCT CLOTHING IMAGES")
    print("=" * 60)
    product_success = 0
    for i, (filename, prompt) in enumerate(PRODUCT_IMAGES, 1):
        print(f"\n[{i}/10] {filename}")
        output_path = os.path.join(PRODUCTS_DIR, filename)
        if generate_image(prompt, output_path, filename):
            product_success += 1
        time.sleep(3)

    print("\n" + "=" * 60)
    print(f"DONE! Models: {model_success}/10, Products: {product_success}/10")
    print("=" * 60)


if __name__ == "__main__":
    main()
