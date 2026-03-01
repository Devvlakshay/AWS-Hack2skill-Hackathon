"""
Fashion Model Pydantic schemas for FitView AI.
Phase 2: Product & Model Management.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"


class BodyType(str, Enum):
    SLIM = "slim"
    AVERAGE = "average"
    ATHLETIC = "athletic"
    CURVY = "curvy"
    PLUS_SIZE = "plus_size"


class SkinTone(str, Enum):
    FAIR = "fair"
    MEDIUM = "medium"
    OLIVE = "olive"
    BROWN = "brown"
    DARK = "dark"


class ModelSize(str, Enum):
    S = "S"
    M = "M"
    L = "L"
    XL = "XL"
    XXL = "XXL"


class Measurements(BaseModel):
    """Body measurements in centimeters."""
    bust: float = Field(..., gt=0)
    waist: float = Field(..., gt=0)
    hip: float = Field(..., gt=0)


class ModelCreate(BaseModel):
    """Schema for creating a new fashion model."""
    name: str = Field(..., min_length=1, max_length=200)
    body_type: BodyType
    height_cm: float = Field(..., gt=100, lt=250)
    measurements: Measurements
    skin_tone: SkinTone
    size: ModelSize
    retailer_id: Optional[str] = Field(None, description="Set automatically from auth")
    image_url: str = Field("", description="Model image URL")


class ModelUpdate(BaseModel):
    """Schema for updating an existing fashion model. All fields optional."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    body_type: Optional[BodyType] = None
    height_cm: Optional[float] = Field(None, gt=100, lt=250)
    measurements: Optional[Measurements] = None
    skin_tone: Optional[SkinTone] = None
    size: Optional[ModelSize] = None
    image_url: Optional[str] = None


class ModelResponse(BaseModel):
    """Schema for fashion model response."""
    id: str = Field(..., alias="_id")
    name: str
    gender: Gender = Gender.FEMALE
    body_type: BodyType
    height_cm: float
    measurements: Measurements
    skin_tone: SkinTone
    size: ModelSize
    retailer_id: str
    image_url: str = ""
    usage_count: int = 0
    is_active: bool = True
    is_deleted: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class ModelListResponse(BaseModel):
    """Schema for paginated fashion model list response."""
    models: list[ModelResponse]
    total: int
    page: int
    limit: int
