"""Order models for FitView AI."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class OrderItem(BaseModel):
    product_id: str
    product_name: str = ""
    product_price: float = 0.0
    product_image: str = ""
    size: str = ""
    quantity: int = 1
    retailer_id: str = ""


class OrderCreate(BaseModel):
    items: list[OrderItem]
    address: dict = Field(default_factory=dict)
    payment_method: str = "cod"
    total_price: float = 0.0


class OrderResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    user_name: str = ""
    user_email: str = ""
    items: list[OrderItem]
    address: dict = Field(default_factory=dict)
    payment_method: str = "cod"
    total_price: float = 0.0
    status: str = "confirmed"
    created_at: str = ""

    model_config = {"populate_by_name": True}


class OrderListResponse(BaseModel):
    orders: list[OrderResponse]
    total: int
    page: int
    limit: int
