from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.models.user import UserCreate, UserLogin, UserResponse, UserInDB, TokenResponse
from app.utils.json_store import JsonStore


async def get_user_by_email(store: JsonStore, email: str) -> dict | None:
    user = await store.find_one("users", {"email": email})
    return user


async def register_user(store: JsonStore, user_data: UserCreate) -> TokenResponse:
    existing_user = await get_user_by_email(store, user_data.email)
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

    doc = user_in_db.model_dump()
    # Store role as string value for consistency
    if hasattr(doc.get("role"), "value"):
        doc["role"] = doc["role"].value
    inserted_id = await store.insert_one("users", doc)

    token_data = {"sub": user_data.email, "role": user_data.role.value}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)

    user_response = UserResponse(
        id=inserted_id,
        name=user_data.name,
        email=user_data.email,
        role=user_data.role,
        created_at=user_in_db.created_at,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_response,
    )


async def login_user(store: JsonStore, credentials: UserLogin) -> TokenResponse:
    user = await get_user_by_email(store, credentials.email)
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

    token_data = {"sub": user["email"], "role": user["role"]}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)

    user_response = UserResponse(
        id=user["_id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        created_at=user["created_at"],
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_response,
    )
