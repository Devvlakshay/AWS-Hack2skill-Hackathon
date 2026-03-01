"""
Generate 6 model images + 8 product images using Gemini 3.1 Flash Image Preview.
Total: 14 API calls. Saves as PNG.
"""

import asyncio
import base64
import io
import os
import sys
import time

import httpx
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = "gemini-3.1-flash-image-preview"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
TIMEOUT = 90.0

# --- Image definitions ---

MODELS = [
    {
        "id": "model001",
        "prompt": (
            "Full body fashion photograph of a young Indian woman, age 24, slim build, "
            "fair skin, standing in a natural relaxed pose against a plain light grey studio "
            "background. She is wearing a simple fitted plain white t-shirt and light blue jeans. "
            "Professional fashion photography, soft studio lighting, sharp focus, "
            "full body visible from head to feet. She has a warm natural smile."
        ),
    },
    {
        "id": "model002",
        "prompt": (
            "Full body fashion photograph of a young Indian woman, age 27, average build, "
            "medium brown skin, standing in a confident pose against a plain light grey studio "
            "background. She is wearing a simple plain black tank top and grey trousers. "
            "Professional fashion photography, even studio lighting, sharp focus, "
            "full body visible from head to feet. Natural expression."
        ),
    },
    {
        "id": "model003",
        "prompt": (
            "Full body fashion photograph of a young Indian woman, age 26, curvy build, "
            "brown skin, standing in an elegant pose against a plain light grey studio "
            "background. She is wearing a simple fitted plain maroon top and dark jeans. "
            "Professional fashion photography, soft studio lighting, sharp focus, "
            "full body visible from head to feet. Confident warm expression."
        ),
    },
    {
        "id": "model004",
        "prompt": (
            "Full body fashion photograph of a young Indian man, age 28, athletic muscular build, "
            "medium brown skin, standing in a confident pose against a plain light grey studio "
            "background. He is wearing a simple fitted plain white t-shirt and dark navy trousers. "
            "Professional fashion photography, studio lighting, sharp focus, "
            "full body visible from head to feet. Strong jawline, short hair."
        ),
    },
    {
        "id": "model005",
        "prompt": (
            "Full body fashion photograph of a young Indian man, age 30, average build, "
            "brown skin, standing in a relaxed pose against a plain light grey studio "
            "background. He is wearing a simple plain grey crew neck t-shirt and khaki pants. "
            "Professional fashion photography, even studio lighting, sharp focus, "
            "full body visible from head to feet. Friendly natural expression, short beard."
        ),
    },
    {
        "id": "model006",
        "prompt": (
            "Full body fashion photograph of a young Indian man, age 25, slim tall build, "
            "fair skin, standing in a casual pose against a plain light grey studio "
            "background. He is wearing a simple fitted plain black t-shirt and blue jeans. "
            "Professional fashion photography, studio lighting, sharp focus, "
            "full body visible from head to feet. Clean shaven, modern hairstyle."
        ),
    },
]

PRODUCTS = [
    {
        "id": "prod001",
        "prompt": (
            "Professional e-commerce product photograph of a royal blue silk kurta for men, "
            "laid flat on a pure white background. The kurta has intricate golden zari embroidery "
            "on the neckline and cuffs, mandarin collar, full sleeves. Clean flat-lay product "
            "photography, well-lit, no model, just the garment. High resolution, sharp details."
        ),
    },
    {
        "id": "prod002",
        "prompt": (
            "Professional e-commerce product photograph of a classic white formal cotton shirt "
            "for men, laid flat on a pure white background. Slim fit with French cuffs, "
            "premium white buttons, crisp collar. Clean flat-lay product photography, "
            "well-lit, no model, just the garment. High resolution, sharp details."
        ),
    },
    {
        "id": "prod003",
        "prompt": (
            "Professional e-commerce product photograph of an emerald green embroidered Anarkali "
            "dress for women, displayed on a pure white background. Floor-length with delicate "
            "gold thread embroidery, flared silhouette, fitted bodice. Clean product photography, "
            "well-lit, no model, just the garment. High resolution."
        ),
    },
    {
        "id": "prod004",
        "prompt": (
            "Professional e-commerce product photograph of black slim fit stretch denim jeans, "
            "laid flat on a pure white background. Modern slim fit, mid-rise waist, "
            "5-pocket styling, subtle faded wash. Clean flat-lay product photography, "
            "well-lit, no model, just the garment. High resolution, sharp details."
        ),
    },
    {
        "id": "prod005",
        "prompt": (
            "Professional e-commerce product photograph of a rich red Banarasi silk saree "
            "with intricate gold zari weaving, elegantly draped and displayed on a pure white "
            "background. Traditional Indian motifs, luxurious sheen. Clean product photography, "
            "well-lit, no model, just the saree fabric. High resolution."
        ),
    },
    {
        "id": "prod006",
        "prompt": (
            "Professional e-commerce product photograph of an olive green oversized graphic "
            "t-shirt laid flat on a pure white background. Drop shoulder design, bold abstract "
            "geometric print on the front, relaxed streetwear fit. Clean flat-lay product "
            "photography, well-lit, no model, just the garment. High resolution."
        ),
    },
    {
        "id": "prod007",
        "prompt": (
            "Professional e-commerce product photograph of a navy blue quilted bomber jacket "
            "laid flat on a pure white background. Ribbed cuffs and hem, front zip closure, "
            "two side zip pockets, diamond quilting pattern. Clean flat-lay product photography, "
            "well-lit, no model, just the jacket. High resolution."
        ),
    },
    {
        "id": "prod008",
        "prompt": (
            "Professional e-commerce product photograph of a white Chikankari embroidered cotton "
            "kurta with matching palazzo pants set for women, displayed on a pure white background. "
            "Delicate hand-embroidered Lucknowi patterns, elegant neckline. Clean product "
            "photography, well-lit, no model, just the garment set. High resolution."
        ),
    },
]


async def generate_image(prompt: str, save_path: str, label: str) -> bool:
    """Generate a single image via Gemini and save as PNG."""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
        },
    }

    print(f"  [{label}] Generating...")
    start = time.time()

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                ENDPOINT,
                json=payload,
                headers={"Content-Type": "application/json"},
            )
    except httpx.TimeoutException:
        print(f"  [{label}] TIMEOUT after {TIMEOUT}s")
        return False

    elapsed = time.time() - start
    print(f"  [{label}] Response: {resp.status_code} ({elapsed:.1f}s)")

    if resp.status_code == 429:
        print(f"  [{label}] RATE LIMITED. Waiting 30s...")
        await asyncio.sleep(30)
        # Retry once
        try:
            async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                resp = await client.post(
                    ENDPOINT,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                )
            print(f"  [{label}] Retry response: {resp.status_code}")
        except Exception as e:
            print(f"  [{label}] Retry failed: {e}")
            return False

    if resp.status_code != 200:
        print(f"  [{label}] ERROR: {resp.text[:200]}")
        return False

    data = resp.json()
    candidates = data.get("candidates", [])
    if not candidates:
        print(f"  [{label}] ERROR: No candidates")
        return False

    parts = candidates[0].get("content", {}).get("parts", [])
    for part in parts:
        inline_data = part.get("inlineData") or part.get("inline_data")
        if inline_data and "data" in inline_data:
            img_bytes = base64.b64decode(inline_data["data"])
            os.makedirs(os.path.dirname(save_path), exist_ok=True)

            img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
            img.save(save_path, "PNG")
            size_kb = os.path.getsize(save_path) / 1024
            print(f"  [{label}] Saved: {img.size[0]}x{img.size[1]}, {size_kb:.0f}KB -> {save_path}")
            return True

    print(f"  [{label}] ERROR: No image in response")
    return False


async def main():
    if not API_KEY:
        print("ERROR: GEMINI_API_KEY not set")
        sys.exit(1)

    print(f"Model: {MODEL}")
    print(f"Upload dir: {UPLOAD_DIR}")
    print(f"Total images to generate: {len(MODELS) + len(PRODUCTS)}")
    print()

    # Clean old webp files
    for folder in ["models", "products"]:
        folder_path = os.path.join(UPLOAD_DIR, folder)
        if os.path.exists(folder_path):
            for f in os.listdir(folder_path):
                if f.endswith(".webp"):
                    os.remove(os.path.join(folder_path, f))
                    print(f"  Removed old: {folder}/{f}")
    print()

    success = 0
    failed = 0

    # Generate model images (one at a time to avoid rate limits)
    print("=== Generating Model Images (6) ===")
    for m in MODELS:
        path = os.path.join(UPLOAD_DIR, "models", f"{m['id']}_web.png")
        ok = await generate_image(m["prompt"], path, m["id"])
        if ok:
            success += 1
        else:
            failed += 1
        # Small delay between calls to avoid rate limits
        await asyncio.sleep(2)

    print()
    print("=== Generating Product Images (8) ===")
    for p in PRODUCTS:
        path = os.path.join(UPLOAD_DIR, "products", f"{p['id']}_web.png")
        ok = await generate_image(p["prompt"], path, p["id"])
        if ok:
            success += 1
        else:
            failed += 1
        await asyncio.sleep(2)

    print()
    print(f"=== Done! Success: {success}, Failed: {failed} ===")

    if failed > 0:
        print("Re-run this script to retry failed images.")


if __name__ == "__main__":
    asyncio.run(main())
