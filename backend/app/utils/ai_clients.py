"""
AI API Clients for FitView AI.
Phase 3: Core Virtual Try-On Engine.

Clients:
- GeminiImageClient: Image generation using Google Gemini API for virtual try-on and style variations
"""

import asyncio
import base64
import io
import logging
import time
from typing import Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# Gemini Image Client
# -------------------------------------------------------------------

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"
GEMINI_TIMEOUT = 60.0
GEMINI_MAX_RETRIES = 2


class GeminiImageClient:
    """
    Async httpx client for Google Gemini image generation API.
    Uses gemini-3.1-flash-image-preview (or configured model) for:
    - Text-to-image generation
    - Image editing (text + image input)
    - Virtual try-on (model + garment -> composite via Gemini vision)
    """

    def __init__(self):
        self._api_key = settings.GEMINI_API_KEY
        self._model = settings.GEMINI_IMAGE_MODEL
        self._timeout = GEMINI_TIMEOUT

    @property
    def is_available(self) -> bool:
        return bool(self._api_key)

    def _endpoint(self, model: Optional[str] = None) -> str:
        m = model or self._model
        return f"{GEMINI_API_BASE}/models/{m}:generateContent?key={self._api_key}"

    async def generate_image(self, prompt: str, aspect_ratio: str = "1:1") -> bytes:
        """
        Generate an image from a text prompt using Gemini API.

        Returns: PNG image bytes
        """
        if not self._api_key:
            raise GeminiImageError("Gemini API key not configured")

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseModalities": ["TEXT", "IMAGE"],
            },
        }

        return await self._call_api(payload)

    async def edit_image(self, prompt: str, image_bytes: bytes) -> bytes:
        """
        Edit an image using text prompt + image input via Gemini API.

        Args:
            prompt: Text instruction for editing
            image_bytes: Source image bytes

        Returns: Edited PNG image bytes
        """
        if not self._api_key:
            raise GeminiImageError("Gemini API key not configured")

        image_b64 = base64.b64encode(image_bytes).decode("utf-8")

        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": "image/png", "data": image_b64}},
                ]
            }],
            "generationConfig": {
                "responseModalities": ["TEXT", "IMAGE"],
            },
        }

        return await self._call_api(payload)

    async def generate_tryon(self, model_image: bytes, garment_image: bytes) -> bytes:
        """
        Generate a virtual try-on using Gemini vision.
        Sends both model and garment images with a try-on prompt.
        """
        if not self._api_key:
            raise GeminiImageError("Gemini API key not configured")

        model_b64 = base64.b64encode(model_image).decode("utf-8")
        garment_b64 = base64.b64encode(garment_image).decode("utf-8")

        payload = {
            "contents": [{
                "parts": [
                    {
                        "text": (
                            "You are a virtual try-on AI. Given the model photo (first image) "
                            "and the garment photo (second image), generate a photorealistic image "
                            "of the model wearing the garment. Maintain the model's face, body, "
                            "and pose exactly. The garment should look natural on the model with "
                            "proper fit, wrinkles, and lighting. Output only the final image."
                        )
                    },
                    {"inline_data": {"mime_type": "image/png", "data": model_b64}},
                    {"inline_data": {"mime_type": "image/png", "data": garment_b64}},
                ]
            }],
            "generationConfig": {
                "responseModalities": ["TEXT", "IMAGE"],
            },
        }

        return await self._call_api(payload)

    async def generate_multi_garment_tryon(
        self, model_image: bytes, garment_images: list[bytes]
    ) -> bytes:
        """
        Generate a combined outfit try-on using Gemini vision.
        Sends model image + multiple garment images with a combined outfit prompt.
        """
        if not self._api_key:
            raise GeminiImageError("Gemini API key not configured")

        model_b64 = base64.b64encode(model_image).decode("utf-8")

        parts: list[dict] = [
            {
                "text": (
                    "You are a virtual try-on AI. Given the model photo (first image) "
                    "and the following garment photos, generate a single photorealistic image "
                    "of the model wearing ALL the garments together as a complete outfit. "
                    "Maintain the model's face, body, and pose exactly. Each garment should "
                    "look natural on the model with proper fit, wrinkles, and lighting. "
                    "Combine all garments into one cohesive outfit. Output only the final image."
                )
            },
            {"inline_data": {"mime_type": "image/png", "data": model_b64}},
        ]

        for garment_bytes in garment_images:
            garment_b64 = base64.b64encode(garment_bytes).decode("utf-8")
            parts.append({"inline_data": {"mime_type": "image/png", "data": garment_b64}})

        payload = {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "responseModalities": ["TEXT", "IMAGE"],
            },
        }

        return await self._call_api(payload)

    async def generate_style_variation(
        self, base_image: bytes, style: str
    ) -> bytes:
        """
        Generate a style variation of a try-on image.
        """
        style_prompts = {
            "casual": "Show this outfit in a casual street setting with natural daylight, relaxed pose.",
            "formal": "Show this outfit in a formal office or corporate environment with professional lighting.",
            "party": "Show this outfit in an evening party setting with warm ambient lighting and festive background.",
            "traditional": "Show this outfit in a traditional Indian setting with cultural decor and warm lighting.",
        }
        prompt = style_prompts.get(style, f"Show this outfit in a {style} setting with appropriate lighting.")

        return await self.edit_image(prompt, base_image)

    async def _call_api(self, payload: dict) -> bytes:
        """Make a Gemini API call and extract the image from the response."""
        last_error: Optional[Exception] = None

        for attempt in range(GEMINI_MAX_RETRIES + 1):
            try:
                start_time = time.time()
                async with httpx.AsyncClient(timeout=self._timeout) as client:
                    response = await client.post(
                        self._endpoint(),
                        json=payload,
                        headers={"Content-Type": "application/json"},
                    )

                elapsed = time.time() - start_time
                logger.info(f"Gemini API call took {elapsed:.2f}s (attempt {attempt + 1})")

                if response.status_code == 200:
                    return self._extract_image(response.json())

                elif response.status_code == 429:
                    logger.warning(f"Gemini rate limited (attempt {attempt + 1})")
                    if attempt < GEMINI_MAX_RETRIES:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    raise GeminiImageError("API rate limited after all retries")

                elif response.status_code >= 500:
                    logger.warning(f"Gemini server error {response.status_code} (attempt {attempt + 1})")
                    if attempt < GEMINI_MAX_RETRIES:
                        await asyncio.sleep(1)
                        continue
                    raise GeminiImageError(f"API server error: {response.status_code}")

                else:
                    error_detail = response.text[:500]
                    raise GeminiImageError(f"API error {response.status_code}: {error_detail}")

            except httpx.TimeoutException:
                last_error = GeminiImageError(f"API timeout after {self._timeout}s")
                logger.warning(f"Gemini timeout (attempt {attempt + 1})")
                if attempt < GEMINI_MAX_RETRIES:
                    continue
            except GeminiImageError:
                raise
            except Exception as e:
                last_error = GeminiImageError(f"Unexpected error: {str(e)}")
                logger.error(f"Gemini unexpected error: {e}")
                if attempt < GEMINI_MAX_RETRIES:
                    continue

        raise last_error or GeminiImageError("Failed after all retries")

    @staticmethod
    def _extract_image(response_data: dict) -> bytes:
        """Extract base64 image data from Gemini API response."""
        candidates = response_data.get("candidates", [])
        if not candidates:
            raise GeminiImageError("No candidates in API response")

        parts = candidates[0].get("content", {}).get("parts", [])
        for part in parts:
            inline_data = part.get("inlineData") or part.get("inline_data")
            if inline_data and "data" in inline_data:
                return base64.b64decode(inline_data["data"])

        raise GeminiImageError("No image data found in API response")

    async def health_check(self) -> bool:
        """Check if Gemini API is accessible with a minimal request."""
        if not self._api_key:
            return False
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                payload = {
                    "contents": [{"parts": [{"text": "Hello"}]}],
                }
                response = await client.post(
                    self._endpoint(),
                    json=payload,
                    headers={"Content-Type": "application/json"},
                )
                return response.status_code == 200
        except Exception:
            return False


class GeminiImageError(Exception):
    """Custom exception for Gemini Image API errors."""
    pass


# -------------------------------------------------------------------
# Singleton instances
# -------------------------------------------------------------------

gemini_image_client = GeminiImageClient()
