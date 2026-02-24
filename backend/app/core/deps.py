from typing import Callable, List

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.core.security import verify_token
from app.utils.json_store import JsonStore

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")

# Global store — initialized in main.py lifespan
store: JsonStore | None = None


def get_store() -> JsonStore:
    if store is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Data store not available",
        )
    return store


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    s: JsonStore = Depends(get_store),
) -> dict:
    payload = verify_token(token)
    email: str | None = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = await s.find_one("users", {"email": email})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user["id"] = user["_id"]
    return user


def require_role(allowed_roles: List[str]) -> Callable:
    """
    Dependency factory for role-based access control.

    Usage in endpoints:
        @router.get("/admin-only", dependencies=[Depends(require_role(["admin"]))])
        async def admin_endpoint(...):

    Or as a parameter dependency:
        current_user: dict = Depends(require_role(["retailer", "admin"]))
    """

    async def role_checker(
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        user_role = current_user.get("role", "")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(allowed_roles)}. Your role: {user_role}.",
            )
        return current_user

    return role_checker
