from fastapi import APIRouter, Depends

from app.core.deps import get_store, get_current_user
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
