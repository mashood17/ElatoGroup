"""Admin account/role management — the "Users" module. Owner/admin only."""

from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentAdmin, require_role
from app.core.security import hash_password
from app.repositories import admin_repository
from app.schemas.auth import AdminCreateRequest, AdminOut, AdminUpdateRequest

router = APIRouter(prefix="/admin/users", tags=["admin-users"])


@router.get("", response_model=list[AdminOut])
def list_admins(admin: CurrentAdmin = Depends(require_role("owner", "admin"))):
    return admin_repository.list_all()


@router.post("", response_model=AdminOut, status_code=201)
def create_admin(payload: AdminCreateRequest, admin: CurrentAdmin = Depends(require_role("owner"))):
    row = admin_repository.create(payload.email, hash_password(payload.password), payload.role)
    return AdminOut(**row)


@router.patch("/{admin_id}", response_model=AdminOut)
def update_admin(admin_id: str, payload: AdminUpdateRequest, admin: CurrentAdmin = Depends(require_role("owner"))):
    fields = {}
    if payload.role is not None:
        fields["role"] = payload.role
    if payload.password is not None:
        fields["password_hash"] = hash_password(payload.password)
    row = admin_repository.update(admin_id, fields)
    return AdminOut(**row)


@router.delete("/{admin_id}", status_code=204)
def delete_admin(admin_id: str, admin: CurrentAdmin = Depends(require_role("owner"))):
    if admin_id == admin.id:
        from app.core.exceptions import AppError

        raise AppError(code="cannot_delete_self", message="You cannot delete your own account.", status_code=400)
    admin_repository.delete(admin_id)
