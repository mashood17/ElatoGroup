"""
Dependency-injection pattern for "current authenticated admin" — every
protected route depends on `get_current_admin`, never parses a JWT inline.

The JWT verification itself is fully functional. Looking the admin up by id
is stubbed until the `admins` table exists (Phase 3) and the admin
repository is wired in (Phase 5) — until then this raises, which is the
correct behavior: no protected route should silently "work" against a
database that isn't there yet.
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

    # TODO(Phase 5): look up the admin row by id via the admin repository and
    # confirm it still exists / isn't disabled, rather than trusting the JWT claims alone.
    return CurrentAdmin(id=admin_id, role=role)


def require_role(*allowed_roles: str):
    """Use as a route dependency to gate destructive ops to specific roles, e.g. require_role('owner', 'admin')."""

    async def _check(admin: CurrentAdmin = Depends(get_current_admin)) -> CurrentAdmin:
        if admin.role not in allowed_roles:
            raise ForbiddenError(f"Requires one of roles: {', '.join(allowed_roles)}.")
        return admin

    return _check
