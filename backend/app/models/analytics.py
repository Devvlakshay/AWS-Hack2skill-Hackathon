"""
Analytics Pydantic schemas for FitView AI.
Phase 5: Retailer Analytics Dashboard.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TopProduct(BaseModel):
    """Top product by try-on count."""
    product_id: str
    name: str
    tryon_count: int
    favorite_count: int = 0


class TopModel(BaseModel):
    """Top model by try-on count."""
    model_id: str
    name: str
    tryon_count: int


class DashboardSummary(BaseModel):
    """Full dashboard analytics summary for a retailer."""
    total_tryons: int = 0
    total_products: int = 0
    total_models: int = 0
    total_favorites: int = 0
    avg_processing_time_ms: float = 0.0
    tryons_by_date: dict[str, int] = Field(default_factory=dict)
    top_products: list[TopProduct] = Field(default_factory=list)
    top_models: list[TopModel] = Field(default_factory=list)
    category_distribution: dict[str, int] = Field(default_factory=dict)
    ai_provider_distribution: dict[str, int] = Field(default_factory=dict)


class ProductAnalytics(BaseModel):
    """Detailed analytics for a specific product."""
    product_id: str
    product_name: str
    tryon_count: int = 0
    favorite_count: int = 0
    avg_processing_time_ms: float = 0.0
    model_preferences: list[TopModel] = Field(default_factory=list)
    tryons_by_date: dict[str, int] = Field(default_factory=dict)
    recent_tryons: list[dict] = Field(default_factory=list)


class AnalyticsEvent(BaseModel):
    """Schema for tracking analytics events."""
    event_type: str = Field(..., description="tryon_generated | product_viewed | product_favorited | style_variation")
    user_id: str
    product_id: Optional[str] = None
    metadata: Optional[dict] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
