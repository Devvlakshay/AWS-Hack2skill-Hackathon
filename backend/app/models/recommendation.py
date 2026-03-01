"""
Recommendation Pydantic schemas for FitView AI.
Phase 4: Intelligence Layer.
"""

from typing import Optional

from pydantic import BaseModel, Field


class SizeRecommendation(BaseModel):
    """Schema for size recommendation response."""
    recommended_size: str = Field(..., description="Recommended size label (e.g., M, L)")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score 0-1")
    reasoning: str = Field(..., description="Human-readable explanation")
    all_sizes: list[dict] = Field(default_factory=list, description="All sizes with scores")


class StyleRecommendation(BaseModel):
    """Schema for style recommendation response."""
    products: list[dict] = Field(default_factory=list, description="Recommended products")
    based_on: str = Field(default="", description="Basis for recommendations")
    total: int = Field(default=0, description="Total recommendations available")
