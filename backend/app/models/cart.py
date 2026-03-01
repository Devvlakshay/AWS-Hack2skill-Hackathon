"""
Cart Pydantic schemas for FitView AI.
Phase 4: Intelligence Layer.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CartItemRequest(BaseModel):
    """Schema for adding/updating a cart item."""
    product_id: str = Field(..., description="Product ID to add")
    size: str = Field(..., description="Selected size")
    quantity: int = Field(1, ge=1, le=10, description="Quantity to add")


class CartItemUpdate(BaseModel):
    """Schema for updating a cart item."""
    size: Optional[str] = Field(None, description="New size")
    quantity: Optional[int] = Field(None, ge=1, le=10, description="New quantity")


class CartItemResponse(BaseModel):
    """Schema for a single cart item in the response."""
    product_id: str
    size: str
    quantity: int
    added_at: str
    product_name: str = ""
    product_price: float = 0
    product_image: str = ""
    tryon_image_url: str = ""


class CartResponse(BaseModel):
    """Schema for the full cart response."""
    items: list[CartItemResponse] = Field(default_factory=list)
    total_items: int = 0
    total_price: float = 0
