"""
Chatbot service using AWS Bedrock (Claude) with Gemini fallback.
Manages conversation sessions in Redis with product context.
"""
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

import httpx
from app.models.chatbot import ChatMessage, MessageRole
from app.utils.bedrock_client import bedrock_chat_client, BedrockError
from app.core.config import settings

logger = logging.getLogger(__name__)

# Redis TTL for chat sessions (24 hours)
CHAT_SESSION_TTL = 86400
MAX_HISTORY_MESSAGES = 20


def _build_system_prompt(user: dict, context: dict) -> str:
    """Build a context-aware system prompt for the chatbot."""
    cart_items = context.get("cart_items", [])
    recent_tryons = context.get("recent_tryons", [])
    top_products = context.get("top_products", [])

    cart_text = ""
    if cart_items:
        items = [f"- {item.get('name', 'item')} (size {item.get('size', '?')})" for item in cart_items[:5]]
        cart_text = f"\nUser's cart:\n" + "\n".join(items)

    tryon_text = ""
    if recent_tryons:
        items = [f"- {t.get('product_name', 'item')}" for t in recent_tryons[:3]]
        tryon_text = f"\nRecent try-ons:\n" + "\n".join(items)

    product_text = ""
    if top_products:
        items = [f"- {p.get('name', '')} ({p.get('category', '')}, \u20b9{p.get('price', 0)})" for p in top_products[:10]]
        product_text = f"\nAvailable products (sample):\n" + "\n".join(items)

    return f"""You are FitView AI Assistant, an AI-powered fashion stylist and shopping guide for FitView — an Indian virtual try-on platform.

User: {user.get('name', 'Customer')} (role: {user.get('role', 'customer')})
{cart_text}
{tryon_text}
{product_text}

Your capabilities:
- Help users find the right clothes for occasions (wedding, office, casual, party, festival)
- Suggest sizes based on measurements
- Recommend products from the catalog
- Explain how virtual try-on works
- Answer FAQs about orders, returns, and the platform
- Provide style tips and outfit combinations

Guidelines:
- Be friendly, helpful, and concise
- Use Indian fashion context (kurta, saree, lehenga, western wear, etc.)
- Mention prices in Indian Rupees (\u20b9)
- If suggesting products, mention them by name clearly
- Keep responses under 150 words unless detailed help is needed
- If asked about something outside fashion/shopping, politely redirect
"""


async def _gemini_chat_fallback(messages: list[dict], system_prompt: str) -> str:
    """Use Gemini API as chat fallback when Bedrock is unavailable."""
    # Build conversation text for Gemini
    parts = []
    if system_prompt:
        parts.append({"text": f"System instructions:\n{system_prompt}\n\nConversation:"})
    for msg in messages:
        role_label = "User" if msg["role"] == "user" else "Assistant"
        parts.append({"text": f"{role_label}: {msg['content']}"})
    parts.append({"text": "Assistant:"})

    payload = {
        "contents": [{"parts": parts}],
        "generationConfig": {"maxOutputTokens": 512, "thinkingConfig": {"thinkingBudget": 0}},
    }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent"
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            url,
            json=payload,
            headers={
                "Content-Type": "application/json",
                "X-Goog-Api-Key": settings.GEMINI_API_KEY or "",
            },
        )
    if response.status_code != 200:
        raise Exception(f"Gemini chat error: {response.status_code} {response.text[:200]}")

    data = response.json()
    candidates = data.get("candidates", [])
    if candidates:
        parts_out = candidates[0].get("content", {}).get("parts", [])
        for part in parts_out:
            if "text" in part:
                return part["text"]
    raise Exception("No text in Gemini chat response")


async def get_or_create_session(redis_client, session_id: Optional[str]) -> str:
    """Get existing session or create new one."""
    if session_id:
        # Verify session exists
        if redis_client:
            exists = await redis_client.exists(f"chat:{session_id}:history")
            if exists:
                return session_id
    return str(uuid.uuid4())


async def get_session_history(redis_client, session_id: str) -> list[dict]:
    """Get conversation history from Redis."""
    if not redis_client:
        return []
    try:
        raw = await redis_client.lrange(f"chat:{session_id}:history", 0, -1)
        return [json.loads(msg) for msg in raw]
    except Exception as e:
        logger.warning(f"Failed to get chat history: {e}")
        return []


async def append_message(redis_client, session_id: str, role: str, content: str):
    """Append a message to the session history in Redis."""
    if not redis_client:
        return
    key = f"chat:{session_id}:history"
    msg = json.dumps({"role": role, "content": content, "timestamp": datetime.now(timezone.utc).isoformat()})
    try:
        await redis_client.rpush(key, msg)
        # Keep only last MAX_HISTORY_MESSAGES
        length = await redis_client.llen(key)
        if length > MAX_HISTORY_MESSAGES * 2:  # *2 because user+assistant pairs
            await redis_client.ltrim(key, -MAX_HISTORY_MESSAGES * 2, -1)
        await redis_client.expire(key, CHAT_SESSION_TTL)
    except Exception as e:
        logger.warning(f"Failed to append chat message: {e}")


async def send_message(
    message: str,
    session_id: str,
    user: dict,
    redis_client=None,
    store=None,
) -> tuple[str, list[dict] | None]:
    """
    Send a user message and get AI response.
    Returns (response_text, suggested_products_or_None).
    """
    # Get conversation history
    history = await get_session_history(redis_client, session_id)

    # Save user message
    await append_message(redis_client, session_id, "user", message)

    # Build messages list for Bedrock
    messages = [{"role": h["role"], "content": h["content"]} for h in history]
    messages.append({"role": "user", "content": message})

    # Build context
    context = {}
    if store:
        try:
            cart = await store.find_one("carts", {"user_id": user.get("_id", "")})
            if cart:
                context["cart_items"] = cart.get("items", [])[:5]
        except Exception:
            pass
        try:
            tryons = await store.find_many(
                "tryon_sessions",
                {"user_id": user.get("_id", "")},
                limit=3,
                sort_field="created_at",
                sort_order=-1,
            )
            context["recent_tryons"] = tryons
        except Exception:
            pass
        try:
            products = await store.find_many(
                "products",
                {"is_deleted": False},
                limit=10,
                sort_field="created_at",
                sort_order=-1,
            )
            context["top_products"] = products
        except Exception:
            pass

    system_prompt = _build_system_prompt(user, context)

    # Get AI response — try Bedrock Claude first (primary), Gemini as fallback
    response_text = None

    # Try Bedrock Claude first (primary chatbot engine)
    if settings.USE_BEDROCK:
        try:
            response_text = await bedrock_chat_client.chat(
                messages=messages,
                system_prompt=system_prompt,
                max_tokens=512,
            )
        except BedrockError as e:
            logger.warning(f"Bedrock chat failed: {e}")

    # Gemini fallback (if Bedrock unavailable or failed)
    if not response_text and settings.GEMINI_API_KEY:
        try:
            response_text = await _gemini_chat_fallback(messages, system_prompt)
        except Exception as e:
            logger.warning(f"Gemini chat fallback also failed: {e}")

    if not response_text:
        response_text = (
            "I'm having trouble connecting right now. Please try again in a moment, "
            "or browse our product catalog directly!"
        )

    # Save assistant response
    await append_message(redis_client, session_id, "assistant", response_text)

    # Extract product suggestions if any
    suggested_products = None
    if store and any(word in message.lower() for word in ["show", "find", "recommend", "suggest", "looking for"]):
        try:
            products = await store.find_many(
                "products",
                {"is_deleted": False},
                limit=3,
            )
            if products:
                suggested_products = [
                    {"id": p["_id"], "name": p["name"], "price": p["price"], "category": p["category"]}
                    for p in products
                ]
        except Exception:
            pass

    return response_text, suggested_products


async def clear_session(redis_client, session_id: str) -> bool:
    """Clear a chat session."""
    if not redis_client:
        return False
    try:
        await redis_client.delete(f"chat:{session_id}:history")
        return True
    except Exception:
        return False
