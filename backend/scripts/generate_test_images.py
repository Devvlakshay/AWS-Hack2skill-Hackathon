"""
Generate real model + garment images using Gemini, then test the try-on pipeline.
Minimal API usage: 2 image generations + 1 try-on = 3 calls total.
"""

import asyncio
import base64
import os
import sys
import time

import httpx
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = "gemini-2.0-flash-exp-image-generation"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")

TIMEOUT = 60.0


async def generate_image(prompt: str, filename: str) -> str:
    """Generate a single image via Gemini and save it."""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
        },
    }

    print(f"  Generating: {filename}...")
    start = time.time()

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(
            ENDPOINT,
            json=payload,
            headers={"Content-Type": "application/json"},
        )

    elapsed = time.time() - start
    print(f"  API response: {resp.status_code} ({elapsed:.1f}s)")

    if resp.status_code != 200:
        print(f"  ERROR: {resp.text[:300]}")
        return ""

    data = resp.json()
    candidates = data.get("candidates", [])
    if not candidates:
        print("  ERROR: No candidates in response")
        return ""

    parts = candidates[0].get("content", {}).get("parts", [])
    for part in parts:
        inline_data = part.get("inlineData") or part.get("inline_data")
        if inline_data and "data" in inline_data:
            img_bytes = base64.b64decode(inline_data["data"])
            filepath = os.path.join(UPLOAD_DIR, filename)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)

            # Save as PNG first, then convert to WebP
            from PIL import Image
            import io
            img = Image.open(io.BytesIO(img_bytes))
            # Save as webp
            webp_path = filepath
            if not webp_path.endswith(".webp"):
                webp_path = filepath.rsplit(".", 1)[0] + ".webp"
            img.save(webp_path, "WEBP", quality=90)
            print(f"  Saved: {webp_path} ({img.size[0]}x{img.size[1]}, {os.path.getsize(webp_path)} bytes)")
            return webp_path

        # Check for text response
        if "text" in part:
            print(f"  Got text instead of image: {part['text'][:200]}")

    print("  ERROR: No image data in response")
    return ""


async def main():
    if not API_KEY:
        print("ERROR: GEMINI_API_KEY not set in .env")
        sys.exit(1)

    print(f"API Key: {API_KEY[:10]}...{API_KEY[-4:]}")
    print(f"Model: {MODEL}")
    print(f"Upload dir: {UPLOAD_DIR}")
    print()

    # Step 1: Generate a realistic model image
    print("Step 1/2: Generating model image...")
    model_path = await generate_image(
        prompt=(
            "Full body photograph of a young Indian woman standing in a neutral pose "
            "against a plain white studio background. She is wearing a simple fitted "
            "white t-shirt and blue jeans. Natural studio lighting, fashion photography "
            "style. Sharp focus, high quality. The woman has a natural expression. "
            "Full body visible from head to feet."
        ),
        filename="models/model001_web.webp",
    )

    if not model_path:
        print("Failed to generate model image. Exiting.")
        sys.exit(1)

    print()

    # Step 2: Generate a realistic garment image
    print("Step 2/2: Generating garment image...")
    garment_path = await generate_image(
        prompt=(
            "Product photograph of a beautiful royal blue silk kurta laid flat on a "
            "plain white background. Traditional Indian men's kurta with intricate "
            "golden embroidery on the neckline and cuffs. Clean product photography, "
            "well-lit, no model, just the garment. E-commerce style product shot."
        ),
        filename="products/prod001_web.webp",
    )

    if not garment_path:
        print("Failed to generate garment image. Exiting.")
        sys.exit(1)

    print()
    print("Done! Images generated successfully.")
    print(f"  Model:   {model_path}")
    print(f"  Garment: {garment_path}")
    print()
    print("Now test the try-on flow:")
    print("  1. Start backend: uvicorn app.main:app --reload")
    print("  2. Start frontend: cd ../frontend && npm run dev")
    print("  3. Login, go to Try-On, select model 'Ananya' + product 'Royal Blue Silk Kurta'")
    print("  4. Generate try-on (uses 1 more API call)")


if __name__ == "__main__":
    asyncio.run(main())
