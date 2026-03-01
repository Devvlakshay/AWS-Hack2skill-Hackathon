"""
Wishlist Pydantic schemas for FitView AI.
Phase 4: Intelligence Layer.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class WishlistItemRequest(BaseModel):
    """Schema for adding a wishlist item."""
    product_id: str = Field(..., description="Product ID to add")
    tryon_image_url: Optional[str] = Field(None, description="Try-on image URL if available")


class WishlistItemResponse(BaseModel):
    """Schema for a single wishlist item in the response."""
    model_config = {
        "populate_by_name": True,
        "json_encoders": {datetime: lambda v: v.isoformat()},
    }

    id: str = Field(..., alias="_id")
    user_id: str
    product_id: str
    tryon_image_url: str = ""
    added_at: str
    product_name: str = ""
    product_price: float = 0
    product_image: str = ""
    product_category: str = ""


class WishlistResponse(BaseModel):
    """Schema for the full wishlist response."""
    items: list[WishlistItemResponse] = Field(default_factory=list)
    total: int = 0
