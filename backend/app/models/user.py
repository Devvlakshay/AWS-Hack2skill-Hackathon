from datetime import datetime, timezone
from typing import Optional
from enum import Enum

from pydantic import BaseModel, EmailStr, Field, field_validator


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class UserRole(str, Enum):
    CUSTOMER = "customer"
    RETAILER = "retailer"
    ADMIN = "admin"


def _validate_password_complexity(v: str) -> str:
    if not any(c.isupper() for c in v):
        raise ValueError("Password must contain at least one uppercase letter")
    if not any(c.islower() for c in v):
        raise ValueError("Password must contain at least one lowercase letter")
    if not any(c.isdigit() for c in v):
        raise ValueError("Password must contain at least one digit")
    return v


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=12, max_length=128)
    phone: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        return _validate_password_complexity(v)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    created_at: datetime


class UserInDB(BaseModel):
    name: str
    email: str
    hashed_password: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    created_at: datetime = Field(default_factory=_utc_now)
    updated_at: datetime = Field(default_factory=_utc_now)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserResponse
