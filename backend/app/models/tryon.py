"""
Try-On Pydantic schemas for FitView AI.
Phase 3: Core Virtual Try-On Engine.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TryOnRequest(BaseModel):
    """Schema for requesting a virtual try-on generation."""
    model_config = {"protected_namespaces": ()}

    model_id: str = Field(..., description="Fashion model ID")
    product_id: str = Field(..., description="Product/garment ID")


class TryOnResponse(BaseModel):
    """Schema for try-on generation response."""
    model_config = {
        "populate_by_name": True,
        "protected_namespaces": (),
        "json_encoders": {datetime: lambda v: v.isoformat()},
    }

    id: str = Field(..., alias="_id")
    user_id: str
    model_id: str
    product_id: str
    result_url: str = Field(..., description="URL of the generated try-on image")
    model_name: str = ""
    product_name: str = ""
    model_image_url: str = ""
    product_image_url: str = ""
    status: str = Field(default="completed", description="pending | processing | completed | failed")
    processing_time_ms: int = Field(default=0, description="Time taken to generate in milliseconds")
    is_favorite: bool = False
    ai_provider: str = Field(default="fallback", description="AI provider used: gemini or fallback")
    created_at: datetime
    expires_at: Optional[datetime] = None


class TryOnHistoryResponse(BaseModel):
    """Schema for paginated try-on history response."""
    sessions: list[TryOnResponse]
    total: int
    page: int
    limit: int


class TryOnFavoriteRequest(BaseModel):
    """Schema for toggling favorite on a try-on session."""
    is_favorite: bool


class BatchTryOnRequest(BaseModel):
    """Schema for requesting batch virtual try-on generation (multiple garments)."""
    model_config = {"protected_namespaces": ()}

    model_id: str = Field(..., description="Fashion model ID")
    product_ids: list[str] = Field(
        ...,
        min_length=1,
        max_length=5,
        description="List of product/garment IDs (1-5)",
    )


class BatchTryOnResponse(BaseModel):
    """Schema for batch try-on generation response."""
    batch_id: str
    individual_results: list[TryOnResponse]
    combined_result: Optional[TryOnResponse] = None
    total_processing_time_ms: int
    product_count: int
