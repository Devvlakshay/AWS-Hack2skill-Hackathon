"""
AWS Bedrock client for AI image generation and chat.
Uses boto3 with asyncio thread pool for async compatibility.
"""
import asyncio
import base64
import json
import logging
from typing import Optional
import boto3
from botocore.exceptions import ClientError
from app.core.config import settings

logger = logging.getLogger(__name__)


class BedrockError(Exception):
    pass


class BedrockImageClient:
    """
    AWS Bedrock client for virtual try-on and style variation generation.
    Uses Claude 3.5 Sonnet Vision capabilities.
    """

    def __init__(self):
        self._client = None
        self.model_id = settings.BEDROCK_MODEL_ID
        self.region = settings.BEDROCK_REGION

    def _get_client(self):
        if self._client is None:
            self._client = boto3.client(
                "bedrock-runtime",
                region_name=self.region,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID or None,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY or None,
            )
        return self._client

    def _encode_image(self, image_bytes: bytes) -> str:
        return base64.standard_b64encode(image_bytes).decode("utf-8")

    def _invoke_model_sync(self, body: dict) -> dict:
        client = self._get_client()
        response = client.invoke_model(
            modelId=self.model_id,
            body=json.dumps(body),
            contentType="application/json",
            accept="application/json",
        )
        return json.loads(response["body"].read())

    async def _invoke_model(self, body: dict) -> dict:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._invoke_model_sync, body)

    async def generate_tryon(self, model_image: bytes, garment_image: bytes) -> bytes:
        """Generate virtual try-on using Claude 3.5 Vision."""
        model_b64 = self._encode_image(model_image)
        garment_b64 = self._encode_image(garment_image)

        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2048,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Image 1 is a fashion model. Image 2 is a garment.",
                        },
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": model_b64,
                            },
                        },
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": garment_b64,
                            },
                        },
                        {
                            "type": "text",
                            "text": (
                                "Generate a photorealistic virtual try-on image showing the model "
                                "wearing the garment from Image 2. Maintain the model's pose, "
                                "skin tone, and lighting. Ensure natural draping and fit. "
                                "Output a high quality PNG image."
                            ),
                        },
                    ],
                }
            ],
        }

        try:
            result = await self._invoke_model(body)
            for block in result.get("content", []):
                if block.get("type") == "image":
                    img_data = block["source"]["data"]
                    return base64.b64decode(img_data)
            raise BedrockError("No image in Bedrock response")
        except ClientError as e:
            raise BedrockError(f"Bedrock API error: {e}") from e

    async def generate_style_variation(self, base_image: bytes, style: str) -> bytes:
        """Generate style variation using Claude Vision."""
        style_prompts = {
            "casual": "casual street style, natural daylight, relaxed setting",
            "formal": "formal office environment, professional lighting",
            "party": "evening party setting, warm ambient lighting",
            "traditional": "traditional Indian festival setting, warm golden lighting",
        }
        style_desc = style_prompts.get(style, style)
        img_b64 = self._encode_image(base_image)

        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2048,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": img_b64,
                            },
                        },
                        {
                            "type": "text",
                            "text": (
                                f"Generate a style variation of this outfit image for a {style_desc}. "
                                "Keep the same garment but adjust the background, lighting, and "
                                "overall mood to match the context. High quality PNG output."
                            ),
                        },
                    ],
                }
            ],
        }

        try:
            result = await self._invoke_model(body)
            for block in result.get("content", []):
                if block.get("type") == "image":
                    return base64.b64decode(block["source"]["data"])
            raise BedrockError("No image in style variation response")
        except ClientError as e:
            raise BedrockError(f"Bedrock style variation error: {e}") from e


class BedrockChatClient:
    """
    AWS Bedrock client for conversational AI (chatbot).
    Uses Claude 3.5 Haiku for fast, cost-effective responses.
    """

    def __init__(self):
        self._client = None
        self.model_id = settings.BEDROCK_CHAT_MODEL_ID
        self.region = settings.BEDROCK_REGION

    def _get_client(self):
        if self._client is None:
            self._client = boto3.client(
                "bedrock-runtime",
                region_name=self.region,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID or None,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY or None,
            )
        return self._client

    def _invoke_sync(self, body: dict) -> dict:
        client = self._get_client()
        response = client.invoke_model(
            modelId=self.model_id,
            body=json.dumps(body),
            contentType="application/json",
            accept="application/json",
        )
        return json.loads(response["body"].read())

    async def chat(
        self,
        messages: list[dict],
        system_prompt: str = "",
        max_tokens: int = 1024,
    ) -> str:
        """Send messages and get a response string."""
        body: dict = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "messages": messages,
        }
        if system_prompt:
            body["system"] = system_prompt

        loop = asyncio.get_event_loop()
        try:
            result = await loop.run_in_executor(None, self._invoke_sync, body)
            content = result.get("content", [])
            for block in content:
                if block.get("type") == "text":
                    return block["text"]
            return "I'm sorry, I couldn't generate a response. Please try again."
        except ClientError as e:
            logger.error(f"Bedrock chat error: {e}")
            raise BedrockError(f"Chat failed: {e}") from e


# Singleton instances
bedrock_image_client = BedrockImageClient()
bedrock_chat_client = BedrockChatClient()
