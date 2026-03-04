from datetime import datetime, timezone

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
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


async def amazon_oauth_callback(store: JsonStore, code: str, redirect_uri: str) -> TokenResponse:
    """Exchange Amazon auth code for tokens, find or create user, return JWT."""
    # 1. Exchange code for Amazon access token
    async with httpx.AsyncClient(timeout=15.0) as client:
        token_resp = await client.post(
            "https://api.amazon.com/auth/o2/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri,
                "client_id": settings.LWA_CLIENT_ID,
                "client_secret": settings.LWA_CLIENT_SECRET,
            },
        )
        if token_resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange Amazon authorization code",
            )
        amazon_tokens = token_resp.json()
        amazon_access_token = amazon_tokens.get("access_token")

        # 2. Fetch user profile from Amazon
        profile_resp = await client.get(
            "https://api.amazon.com/user/profile",
            headers={"Authorization": f"Bearer {amazon_access_token}"},
        )
        if profile_resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch Amazon user profile",
            )
        profile = profile_resp.json()

    amazon_email = profile.get("email")
    amazon_name = profile.get("name", "Amazon User")
    amazon_user_id = profile.get("user_id")

    if not amazon_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No email associated with this Amazon account",
        )

    # 3. Find existing user by email or create new one
    user = await get_user_by_email(store, amazon_email)
    now = datetime.now(timezone.utc)

    if user:
        # Link Amazon ID if not already linked
        if not user.get("amazon_user_id"):
            await store.update_one(
                "users",
                {"email": amazon_email},
                {"amazon_user_id": amazon_user_id, "auth_provider": "amazon", "updated_at": now},
            )
            user["amazon_user_id"] = amazon_user_id
            user["auth_provider"] = "amazon"
    else:
        # Create new user (no password — OAuth-only)
        user_in_db = UserInDB(
            name=amazon_name,
            email=amazon_email,
            hashed_password="",
            auth_provider="amazon",
            amazon_user_id=amazon_user_id,
            created_at=now,
            updated_at=now,
        )
        doc = user_in_db.model_dump()
        if hasattr(doc.get("role"), "value"):
            doc["role"] = doc["role"].value
        inserted_id = await store.insert_one("users", doc)
        user = {**doc, "_id": inserted_id}

    # 4. Issue JWT tokens
    role = user.get("role", "customer")
    if hasattr(role, "value"):
        role = role.value
    token_data = {"sub": user["email"], "role": role}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)

    user_response = UserResponse(
        id=user["_id"],
        name=user.get("name", amazon_name),
        email=user["email"],
        role=role,
        created_at=user.get("created_at", now),
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
