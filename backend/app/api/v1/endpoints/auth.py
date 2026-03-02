from fastapi import APIRouter, Depends, Body, HTTPException, status

from app.core.deps import get_store, get_current_user
from app.core.security import create_access_token, create_refresh_token, verify_refresh_token
from app.models.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.services import auth_service
from app.utils.json_store import JsonStore

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    user_data: UserCreate,
    store: JsonStore = Depends(get_store),
):
    return await auth_service.register_user(store, user_data)


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    store: JsonStore = Depends(get_store),
):
    return await auth_service.login_user(store, credentials)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        created_at=current_user["created_at"],
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str = Body(..., embed=True),
    store: JsonStore = Depends(get_store),
):
    """Exchange a valid refresh token for a new access token and refresh token pair."""
    payload = verify_refresh_token(refresh_token)
    email: str | None = payload.get("sub")
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = await store.find_one("users", {"email": email})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    token_data = {"sub": user["email"], "role": user.get("role", "customer")}
    new_access_token = create_access_token(data=token_data)
    new_refresh_token = create_refresh_token(data=token_data)

    user_response = UserResponse(
        id=user["_id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        created_at=user["created_at"],
    )

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        user=user_response,
    )


@router.get("/me/export")
async def export_my_data(
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """
    DPDPA compliance: Export all personal data associated with this account.
    Returns user profile, try-on history, cart, and wishlist as JSON.
    """
    user_id = current_user["id"]

    tryon_sessions = await store.find_many("tryon_sessions", {"user_id": user_id})
    cart = await store.find_one("carts", {"user_id": user_id})
    wishlist_items = await store.find_many("wishlists", {"user_id": user_id})

    # Strip internal fields for cleaner export
    profile = {k: v for k, v in current_user.items() if k not in ("hashed_password", "_id")}

    return {
        "profile": profile,
        "tryon_history": tryon_sessions or [],
        "cart": cart or {},
        "wishlist": wishlist_items or [],
    }


@router.delete("/me", status_code=204)
async def delete_my_account(
    current_user: dict = Depends(get_current_user),
    store: JsonStore = Depends(get_store),
):
    """
    DPDPA compliance: Permanently delete this account and all associated data.
    Removes user profile, try-on sessions, cart, and wishlist items.
    """
    user_id = current_user["id"]
    email = current_user["email"]

    # Delete all user-associated collections
    await store.delete_many("tryon_sessions", {"user_id": user_id})
    await store.delete_many("carts", {"user_id": user_id})
    await store.delete_many("wishlists", {"user_id": user_id})
    await store.delete_one("users", {"email": email})

    return None
