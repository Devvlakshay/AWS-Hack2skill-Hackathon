from datetime import datetime, timezone

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import UserCreate, UserLogin, UserResponse, UserInDB, TokenResponse


async def create_indexes(db: AsyncIOMotorDatabase) -> None:
    users = db["users"]
    await users.create_index("email", unique=True)
    await users.create_index("role")
    await users.create_index("created_at")


async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> dict | None:
    user = await db["users"].find_one({"email": email})
    return user


async def register_user(db: AsyncIOMotorDatabase, user_data: UserCreate) -> TokenResponse:
    existing_user = await get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )

    user_in_db = UserInDB(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        phone=user_data.phone,
        role=user_data.role,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    result = await db["users"].insert_one(user_in_db.model_dump())

    access_token = create_access_token(
        data={"sub": user_data.email, "role": user_data.role.value}
    )

    user_response = UserResponse(
        id=str(result.inserted_id),
        name=user_data.name,
        email=user_data.email,
        role=user_data.role,
        created_at=user_in_db.created_at,
    )

    return TokenResponse(
        access_token=access_token,
        user=user_response,
    )


async def login_user(db: AsyncIOMotorDatabase, credentials: UserLogin) -> TokenResponse:
    user = await get_user_by_email(db, credentials.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}
    )

    user_response = UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        role=user["role"],
        created_at=user["created_at"],
    )

    return TokenResponse(
        access_token=access_token,
        user=user_response,
    )
