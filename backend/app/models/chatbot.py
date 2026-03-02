from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"


class ChatMessage(BaseModel):
    role: MessageRole
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    message: str
    session_id: str
    timestamp: datetime
    suggested_products: Optional[list[dict]] = None


class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: list[ChatMessage]
    message_count: int
