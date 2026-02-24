"""
Product Pydantic schemas for FitView AI.
Phase 2: Product & Model Management.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl


class SizeStock(BaseModel):
    """Size and stock information for a product variant."""
    size: str = Field(..., description="Size label (e.g., S, M, L, XL, XXL, or numeric)")
    stock: int = Field(..., ge=0, description="Available stock count")


class ProductCreate(BaseModel):
    """Schema for creating a new product."""
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=5000)
    category: str = Field(..., min_length=1, max_length=100)
    subcategory: str = Field("", max_length=100)
    tags: list[str] = Field(default_factory=list)
    price: float = Field(..., gt=0)
    sizes: list[SizeStock] = Field(default_factory=list)
    colors: list[str] = Field(default_factory=list)
    material: str = Field("", max_length=200)
    images: list[str] = Field(default_factory=list, description="List of image URLs")
    size_chart: dict = Field(default_factory=dict, description="Size chart mapping")
    retailer_id: Optional[str] = Field(None, description="Set automatically from auth")


class ProductUpdate(BaseModel):
    """Schema for updating an existing product. All fields optional."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=5000)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    subcategory: Optional[str] = Field(None, max_length=100)
    tags: Optional[list[str]] = None
    price: Optional[float] = Field(None, gt=0)
    sizes: Optional[list[SizeStock]] = None
    colors: Optional[list[str]] = None
    material: Optional[str] = Field(None, max_length=200)
    images: Optional[list[str]] = None
    size_chart: Optional[dict] = None


class ProductResponse(BaseModel):
    """Schema for product response."""
    id: str = Field(..., alias="_id")
    name: str
    description: str
    category: str
    subcategory: str = ""
    tags: list[str] = []
    price: float
    sizes: list[SizeStock] = []
    colors: list[str] = []
    material: str = ""
    images: list[str] = []
    size_chart: dict = {}
    retailer_id: str
    is_deleted: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class ProductListResponse(BaseModel):
    """Schema for paginated product list response."""
    products: list[ProductResponse]
    total: int
    page: int
    limit: int
