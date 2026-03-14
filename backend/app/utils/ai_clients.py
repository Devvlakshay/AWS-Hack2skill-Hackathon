"""
AI API Clients for FitView AI.
Phase 3: Core Virtual Try-On Engine.

Clients:
- VertexAIImageClient: Image generation using Google Vertex AI (service account auth)
- GeminiImageClient: Fallback using direct Gemini API key
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
# Constants
# -------------------------------------------------------------------

VERTEX_AI_TIMEOUT = 90.0
GEMINI_TIMEOUT = 60.0
MAX_RETRIES = 2


class GeminiImageError(Exception):
    """Custom exception for Gemini / Vertex AI Image API errors."""
    pass


# -------------------------------------------------------------------
# Shared helpers
# -------------------------------------------------------------------

def _extract_image(response_data: dict) -> bytes:
    """Extract base64 image data from Gemini / Vertex AI API response."""
    candidates = response_data.get("candidates", [])
    if not candidates:
        raise GeminiImageError("No candidates in API response")

    parts = candidates[0].get("content", {}).get("parts", [])
    for part in parts:
        inline_data = part.get("inlineData") or part.get("inline_data")
        if inline_data and "data" in inline_data:
            return base64.b64decode(inline_data["data"])

    raise GeminiImageError("No image data found in API response")


# -------------------------------------------------------------------
# Vertex AI Image Client (Service Account Auth) — PRIMARY
# -------------------------------------------------------------------


class VertexAIImageClient:
    """
    Async httpx client for Google Vertex AI Gemini image generation.
    Authenticates via service account JSON and uses OAuth2 bearer tokens.
    Uses the same prompts as the direct Gemini API client.
    """

    def __init__(self):
        self._project_id = settings.VERTEX_AI_PROJECT_ID
        self._location = settings.VERTEX_AI_LOCATION
        self._model = settings.GEMINI_IMAGE_MODEL
        self._sa_json_path = settings.VERTEX_AI_SERVICE_ACCOUNT_JSON
        self._timeout = VERTEX_AI_TIMEOUT
        self._credentials = None
        self._initialized = False

    def _init_credentials(self):
        """Lazy-init Google credentials from service account JSON."""
        if self._initialized:
            return
        try:
            from google.oauth2 import service_account
            import google.auth.transport.requests

            scopes = ["https://www.googleapis.com/auth/cloud-platform"]
            self._credentials = service_account.Credentials.from_service_account_file(
                self._sa_json_path, scopes=scopes
            )
            self._initialized = True
            logger.info(f"Vertex AI credentials loaded for project={self._project_id}")
        except Exception as e:
            logger.error(f"Failed to load Vertex AI service account credentials: {e}")
            self._credentials = None
            self._initialized = True

    @property
    def is_available(self) -> bool:
        if not settings.USE_VERTEX_AI or not self._sa_json_path:
            return False
        self._init_credentials()
        return self._credentials is not None

    def _get_access_token(self) -> str:
        """Get a fresh OAuth2 access token, refreshing if needed."""
        import google.auth.transport.requests

        if not self._credentials:
            raise GeminiImageError("Vertex AI credentials not initialized")

        if not self._credentials.valid:
            self._credentials.refresh(google.auth.transport.requests.Request())

        return self._credentials.token

    def _endpoint(self, model: Optional[str] = None) -> str:
        m = model or self._model
        return (
            f"https://{self._location}-aiplatform.googleapis.com/v1/projects/"
            f"{self._project_id}/locations/{self._location}/publishers/google/models/{m}:generateContent"
        )

    async def generate_image(self, prompt: str, aspect_ratio: str = "1:1") -> bytes:
        """Generate an image from a text prompt."""
        if not self.is_available:
            raise GeminiImageError("Vertex AI not configured")

        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseModalities": ["TEXT", "IMAGE"],
            },
        }

        return await self._call_api(payload)

    async def edit_image(self, prompt: str, image_bytes: bytes) -> bytes:
        """Edit an image using text prompt + image input."""
        if not self.is_available:
            raise GeminiImageError("Vertex AI not configured")

        image_b64 = base64.b64encode(image_bytes).decode("utf-8")

        payload = {
            "contents": [{
                "role": "user",
                "parts": [
                    {"text": prompt},
                    {"inlineData": {"mimeType": "image/png", "data": image_b64}},
                ]
            }],
            "generationConfig": {
                "responseModalities": ["TEXT", "IMAGE"],
            },
        }

        return await self._call_api(payload)

    async def generate_tryon(self, model_image: bytes, garment_image: bytes) -> bytes:
        """Generate a virtual try-on using Vertex AI Gemini vision."""
        if not self.is_available:
            raise GeminiImageError("Vertex AI not configured")

        model_b64 = base64.b64encode(model_image).decode("utf-8")
        garment_b64 = base64.b64encode(garment_image).decode("utf-8")

        payload = {
            "contents": [{
                "role": "user",
                "parts": [
                    {"inlineData": {"mimeType": "image/png", "data": model_b64}},
                    {"inlineData": {"mimeType": "image/png", "data": garment_b64}},
                    {
                        "text": (
                            "EDIT this photo. This is a PHOTO EDITING task, NOT image generation. "
                            "Take the EXACT photo in Image 1 and ONLY replace the clothes the person is wearing "
                            "with the garment shown in Image 2. "
                            "CRITICAL — THIS IS AN EDIT, NOT A NEW IMAGE: "
                            "- The output must look like someone Photoshopped new clothes onto the ORIGINAL photo. "
                            "- The person's face MUST be IDENTICAL — same exact pixels for eyes, nose, mouth, expression, skin texture. "
                            "  Do NOT regenerate or redraw the face. Copy it exactly from Image 1. "
                            "- The person's hair MUST be IDENTICAL — same style, color, length, position. "
                            "- The person's skin tone MUST be IDENTICAL. "
                            "- The person's pose and body position MUST be IDENTICAL to Image 1. "
                            "- The background MUST be IDENTICAL to Image 1 — same trees, buildings, sky, furniture, everything. "
                            "  Do NOT replace the background with white or any other color. Keep the ORIGINAL background. "
                            "- The camera angle, framing, and lighting MUST match Image 1 exactly. "
                            "- ONLY the clothing changes. Everything else is a pixel-perfect copy of Image 1. "
                            "- The new garment must fit naturally on the person's body with realistic draping and wrinkles. "
                            "- Output exactly ONE person. Do not duplicate, mirror, or add extra people. "
                            "Think of this as: take the original photo, erase only the clothes, paint in the new garment. "
                            "The result should be indistinguishable from a real photo of this exact person wearing this garment "
                            "in this exact location."
                        )
                    },
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
        """Generate a combined outfit try-on using Vertex AI Gemini vision."""
        if not self.is_available:
            raise GeminiImageError("Vertex AI not configured")

        model_b64 = base64.b64encode(model_image).decode("utf-8")

        parts: list[dict] = [
            {
                "text": (
                    "Virtual try-on task: Dress the person in Image 1 with ALL the garments "
                    "shown in the following images, combined as one complete outfit. "
                    "IMPORTANT — INPUT HANDLING: "
                    "If Image 1 shows only a face, head, or upper body (half photo / selfie / passport photo), "
                    "you MUST generate a natural full body for the person — infer a proportional body, natural standing pose, "
                    "and neutral background. Match the skin tone, complexion, and gender visible in the face photo. "
                    "If Image 1 already shows a full body, keep the original pose and background. "
                    "CRITICAL RULES: "
                    "1. SHOW THE FULL BODY from head to toe — the entire face, head, hair, and feet MUST be visible. "
                    "DO NOT crop or cut off any part of the person. "
                    "2. Output EXACTLY ONE person — never duplicate or mirror the person. "
                    "3. Keep the person's face, skin tone, and hair identical to Image 1. "
                    "4. Combine all garments into one cohesive, natural-looking outfit. "
                    "5. If full body input, preserve the original background. If face/half photo, use a clean neutral background. "
                    "6. The output image must be PORTRAIT orientation (3:4 aspect ratio). "
                    "7. Output a single clean photorealistic image."
                )
            },
            {"inlineData": {"mimeType": "image/png", "data": model_b64}},
        ]

        for garment_bytes in garment_images:
            garment_b64 = base64.b64encode(garment_bytes).decode("utf-8")
            parts.append({"inlineData": {"mimeType": "image/png", "data": garment_b64}})

        payload = {
            "contents": [{"role": "user", "parts": parts}],
            "generationConfig": {
                "responseModalities": ["TEXT", "IMAGE"],
            },
        }

        return await self._call_api(payload)

    async def generate_style_variation(self, base_image: bytes, style: str) -> bytes:
        """Generate a style variation of a try-on image."""
        style_prompts = {
            "casual": "Show this outfit in a casual street setting with natural daylight, relaxed pose.",
            "formal": "Show this outfit in a formal office or corporate environment with professional lighting.",
            "party": "Show this outfit in an evening party setting with warm ambient lighting and festive background.",
            "traditional": "Show this outfit in a traditional Indian setting with cultural decor and warm lighting.",
        }
        prompt = style_prompts.get(style, f"Show this outfit in a {style} setting with appropriate lighting.")
        return await self.edit_image(prompt, base_image)

    async def _call_api(self, payload: dict) -> bytes:
        """Make a Vertex AI API call with OAuth2 bearer token and extract the image."""
        last_error: Optional[Exception] = None

        for attempt in range(MAX_RETRIES + 1):
            try:
                token = await asyncio.get_event_loop().run_in_executor(
                    None, self._get_access_token
                )

                start_time = time.time()
                async with httpx.AsyncClient(timeout=self._timeout) as client:
                    response = await client.post(
                        self._endpoint(),
                        json=payload,
                        headers={
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {token}",
                        },
                    )

                elapsed = time.time() - start_time
                logger.info(f"Vertex AI API call took {elapsed:.2f}s (attempt {attempt + 1})")

                if response.status_code == 200:
                    return _extract_image(response.json())

                elif response.status_code == 429:
                    logger.warning(f"Vertex AI rate limited (attempt {attempt + 1})")
                    if attempt < MAX_RETRIES:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    raise GeminiImageError("API rate limited after all retries")

                elif response.status_code >= 500:
                    logger.warning(f"Vertex AI server error {response.status_code} (attempt {attempt + 1})")
                    if attempt < MAX_RETRIES:
                        await asyncio.sleep(1)
                        continue
                    raise GeminiImageError(f"API server error: {response.status_code}")

                else:
                    error_detail = response.text[:500]
                    raise GeminiImageError(f"Vertex AI error {response.status_code}: {error_detail}")

            except httpx.TimeoutException:
                last_error = GeminiImageError(f"API timeout after {self._timeout}s")
                logger.warning(f"Vertex AI timeout (attempt {attempt + 1})")
                if attempt < MAX_RETRIES:
                    continue
            except GeminiImageError:
                raise
            except Exception as e:
                last_error = GeminiImageError(f"Unexpected error: {str(e)}")
                logger.error(f"Vertex AI unexpected error: {e}")
                if attempt < MAX_RETRIES:
                    continue

        raise last_error or GeminiImageError("Failed after all retries")

    async def health_check(self) -> bool:
        """Check if Vertex AI is accessible."""
        if not self.is_available:
            return False
        try:
            token = await asyncio.get_event_loop().run_in_executor(
                None, self._get_access_token
            )
            async with httpx.AsyncClient(timeout=10.0) as client:
                payload = {
                    "contents": [{"role": "user", "parts": [{"text": "Hello"}]}],
                }
                response = await client.post(
                    self._endpoint(),
                    json=payload,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {token}",
                    },
                )
                return response.status_code == 200
        except Exception:
            return False


# -------------------------------------------------------------------
# Gemini API Key Client — FALLBACK (if Vertex AI not configured)
# -------------------------------------------------------------------

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"


class GeminiImageClient:
    """
    Fallback client using direct Gemini API key auth.
    Used only when Vertex AI service account is not configured.
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
        return f"{GEMINI_API_BASE}/models/{m}:generateContent"

    async def generate_image(self, prompt: str, aspect_ratio: str = "1:1") -> bytes:
        """Generate an image from a text prompt using Gemini API."""
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
        """Edit an image using text prompt + image input via Gemini API."""
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
        """Generate a virtual try-on using Gemini vision."""
        if not self._api_key:
            raise GeminiImageError("Gemini API key not configured")

        model_b64 = base64.b64encode(model_image).decode("utf-8")
        garment_b64 = base64.b64encode(garment_image).decode("utf-8")

        payload = {
            "contents": [{
                "parts": [
                    {"inline_data": {"mime_type": "image/png", "data": model_b64}},
                    {"inline_data": {"mime_type": "image/png", "data": garment_b64}},
                    {
                        "text": (
                            "EDIT this photo. This is a PHOTO EDITING task, NOT image generation. "
                            "Take the EXACT photo in Image 1 and ONLY replace the clothes the person is wearing "
                            "with the garment shown in Image 2. "
                            "CRITICAL — THIS IS AN EDIT, NOT A NEW IMAGE: "
                            "- The output must look like someone Photoshopped new clothes onto the ORIGINAL photo. "
                            "- The person's face MUST be IDENTICAL — same exact pixels for eyes, nose, mouth, expression, skin texture. "
                            "  Do NOT regenerate or redraw the face. Copy it exactly from Image 1. "
                            "- The person's hair MUST be IDENTICAL — same style, color, length, position. "
                            "- The person's skin tone MUST be IDENTICAL. "
                            "- The person's pose and body position MUST be IDENTICAL to Image 1. "
                            "- The background MUST be IDENTICAL to Image 1 — same trees, buildings, sky, furniture, everything. "
                            "  Do NOT replace the background with white or any other color. Keep the ORIGINAL background. "
                            "- The camera angle, framing, and lighting MUST match Image 1 exactly. "
                            "- ONLY the clothing changes. Everything else is a pixel-perfect copy of Image 1. "
                            "- The new garment must fit naturally on the person's body with realistic draping and wrinkles. "
                            "- Output exactly ONE person. Do not duplicate, mirror, or add extra people. "
                            "Think of this as: take the original photo, erase only the clothes, paint in the new garment. "
                            "The result should be indistinguishable from a real photo of this exact person wearing this garment "
                            "in this exact location."
                        )
                    },
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
        """Generate a combined outfit try-on using Gemini vision."""
        if not self._api_key:
            raise GeminiImageError("Gemini API key not configured")

        model_b64 = base64.b64encode(model_image).decode("utf-8")

        parts: list[dict] = [
            {
                "text": (
                    "Virtual try-on task: Dress the person in Image 1 with ALL the garments "
                    "shown in the following images, combined as one complete outfit. "
                    "IMPORTANT — INPUT HANDLING: "
                    "If Image 1 shows only a face, head, or upper body (half photo / selfie / passport photo), "
                    "you MUST generate a natural full body for the person — infer a proportional body, natural standing pose, "
                    "and neutral background. Match the skin tone, complexion, and gender visible in the face photo. "
                    "If Image 1 already shows a full body, keep the original pose and background. "
                    "CRITICAL RULES: "
                    "1. SHOW THE FULL BODY from head to toe — the entire face, head, hair, and feet MUST be visible. "
                    "DO NOT crop or cut off any part of the person. "
                    "2. Output EXACTLY ONE person — never duplicate or mirror the person. "
                    "3. Keep the person's face, skin tone, and hair identical to Image 1. "
                    "4. Combine all garments into one cohesive, natural-looking outfit. "
                    "5. If full body input, preserve the original background. If face/half photo, use a clean neutral background. "
                    "6. The output image must be PORTRAIT orientation (3:4 aspect ratio). "
                    "7. Output a single clean photorealistic image."
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

    async def generate_style_variation(self, base_image: bytes, style: str) -> bytes:
        """Generate a style variation of a try-on image."""
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

        for attempt in range(MAX_RETRIES + 1):
            try:
                start_time = time.time()
                async with httpx.AsyncClient(timeout=self._timeout) as client:
                    response = await client.post(
                        self._endpoint(),
                        json=payload,
                        headers={
                            "Content-Type": "application/json",
                            "X-Goog-Api-Key": self._api_key or "",
                        },
                    )

                elapsed = time.time() - start_time
                logger.info(f"Gemini API call took {elapsed:.2f}s (attempt {attempt + 1})")

                if response.status_code == 200:
                    return _extract_image(response.json())

                elif response.status_code == 429:
                    logger.warning(f"Gemini rate limited (attempt {attempt + 1})")
                    if attempt < MAX_RETRIES:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    raise GeminiImageError("API rate limited after all retries")

                elif response.status_code >= 500:
                    logger.warning(f"Gemini server error {response.status_code} (attempt {attempt + 1})")
                    if attempt < MAX_RETRIES:
                        await asyncio.sleep(1)
                        continue
                    raise GeminiImageError(f"API server error: {response.status_code}")

                else:
                    error_detail = response.text[:500]
                    raise GeminiImageError(f"API error {response.status_code}: {error_detail}")

            except httpx.TimeoutException:
                last_error = GeminiImageError(f"API timeout after {self._timeout}s")
                logger.warning(f"Gemini timeout (attempt {attempt + 1})")
                if attempt < MAX_RETRIES:
                    continue
            except GeminiImageError:
                raise
            except Exception as e:
                last_error = GeminiImageError(f"Unexpected error: {str(e)}")
                logger.error(f"Gemini unexpected error: {e}")
                if attempt < MAX_RETRIES:
                    continue

        raise last_error or GeminiImageError("Failed after all retries")

    async def health_check(self) -> bool:
        """Check if Gemini API is accessible."""
        if not self._api_key:
            return False
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                payload = {"contents": [{"parts": [{"text": "Hello"}]}]}
                response = await client.post(
                    self._endpoint(),
                    json=payload,
                    headers={
                        "Content-Type": "application/json",
                        "X-Goog-Api-Key": self._api_key or "",
                    },
                )
                return response.status_code == 200
        except Exception:
            return False


# -------------------------------------------------------------------
# Singleton: Vertex AI preferred, falls back to API key client
# -------------------------------------------------------------------

_vertex_client = VertexAIImageClient()
_apikey_client = GeminiImageClient()

try:
    if _vertex_client.is_available:
        gemini_image_client = _vertex_client
        logger.info("Using Vertex AI (service account) for image generation")
    else:
        gemini_image_client = _apikey_client
        logger.info("Vertex AI not available, falling back to Gemini API key client")
except Exception as _init_err:
    logger.warning(f"Vertex AI init failed ({_init_err}), falling back to Gemini API key client")
    gemini_image_client = _apikey_client
