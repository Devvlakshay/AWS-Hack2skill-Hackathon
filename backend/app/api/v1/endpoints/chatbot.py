"""
Chatbot API endpoints.
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status

from app.models.chatbot import ChatRequest, ChatResponse, ChatHistoryResponse, ChatMessage, MessageRole
from app.services import chatbot_service
from app.core.deps import get_current_user, get_store
from app.utils.json_store import JsonStore

router = APIRouter()


@router.post("/message", response_model=ChatResponse)
async def send_chat_message(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """Send a message to the AI chatbot and get a response."""
    # Try to get redis client
    redis_client = None
    try:
        from app.core.cache import get_redis
        redis_client = get_redis()
    except Exception:
        pass

    # Get or create session
    session_id = await chatbot_service.get_or_create_session(redis_client, request.session_id)

    # Send message
    response_text, suggested_products = await chatbot_service.send_message(
        message=request.message,
        session_id=session_id,
        user=current_user,
        redis_client=redis_client,
        store=store,
    )

    return ChatResponse(
        message=response_text,
        session_id=session_id,
        timestamp=datetime.utcnow(),
        suggested_products=suggested_products,
    )


@router.get("/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get conversation history for a session."""
    redis_client = None
    try:
        from app.core.cache import get_redis
        redis_client = get_redis()
    except Exception:
        pass

    history = await chatbot_service.get_session_history(redis_client, session_id)
    messages = [
        ChatMessage(
            role=MessageRole(msg["role"]),
            content=msg["content"],
            timestamp=msg.get("timestamp"),
        )
        for msg in history
    ]

    return ChatHistoryResponse(
        session_id=session_id,
        messages=messages,
        message_count=len(messages),
    )


@router.delete("/session", status_code=status.HTTP_204_NO_CONTENT)
async def clear_chat_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Clear a chat session's history."""
    redis_client = None
    try:
        from app.core.cache import get_redis
        redis_client = get_redis()
    except Exception:
        pass

    await chatbot_service.clear_session(redis_client, session_id)
