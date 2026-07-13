"""
Dependency-injection pattern for "current authenticated admin" — every
protected route depends on `get_current_admin`, never parses a JWT inline.
"""

from dataclasses import dataclass

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import TokenError, decode_token

_bearer_scheme = HTTPBearer(auto_error=False)


@dataclass
class CurrentAdmin:
    id: str
    role: str


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> CurrentAdmin:
    if credentials is None:
        raise UnauthorizedError("Missing bearer token.")

    try:
        payload = decode_token(credentials.credentials, expected_type="access")
    except TokenError as exc:
        raise UnauthorizedError("Invalid or expired token.") from exc

    admin_id = payload.get("sub")
    role = payload.get("role")
    if not admin_id or not role:
        raise UnauthorizedError("Token missing required claims.")

    # Confirm the admin row still exists (not deleted) since the JWT was issued —
    # a bare claims check would let a removed admin keep using an unexpired token.
    from app.repositories import admin_repository

    admin_row = admin_repository.get_by_id(admin_id)
    if not admin_row:
        raise UnauthorizedError("Admin account no longer exists.")

    return CurrentAdmin(id=admin_row["id"], role=admin_row["role"])


def require_role(*allowed_roles: str):
    """Use as a route dependency to gate destructive ops to specific roles, e.g. require_role('owner', 'admin')."""

    async def _check(admin: CurrentAdmin = Depends(get_current_admin)) -> CurrentAdmin:
        if admin.role not in allowed_roles:
            raise ForbiddenError(f"Requires one of roles: {', '.join(allowed_roles)}.")
        return admin

    return _check
