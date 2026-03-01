"""
Style Variation Pydantic schemas for FitView AI.
Phase 4: Intelligence Layer.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


SUPPORTED_STYLES = ["casual", "formal", "party", "traditional"]


class StyleVariationRequest(BaseModel):
    """Schema for requesting a style variation."""
    session_id: str = Field(..., description="Try-on session ID to create variation from")
    style: str = Field(..., description="Style type: casual, formal, party, traditional")


class StyleVariationResponse(BaseModel):
    """Schema for style variation response."""
    model_config = {
        "populate_by_name": True,
        "json_encoders": {datetime: lambda v: v.isoformat()},
    }

    id: str = Field(..., alias="_id")
    session_id: str
    user_id: str
    style: str
    image_url: str
    original_image_url: str = ""
    created_at: datetime


class StyleVariationListResponse(BaseModel):
    """Schema for listing style variations for a session."""
    variations: list[StyleVariationResponse]
    session_id: str
