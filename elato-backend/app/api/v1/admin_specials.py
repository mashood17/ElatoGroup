from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentAdmin, get_current_admin, require_role
from app.repositories import special_repository
from app.schemas.common import Page, PaginationParams
from app.schemas.special import SpecialCreate, SpecialOut, SpecialUpdate

router = APIRouter(prefix="/admin/specials", tags=["admin-specials"])


@router.get("", response_model=Page[SpecialOut])
def list_specials(pagination: PaginationParams = Depends(), admin: CurrentAdmin = Depends(get_current_admin)):
    items, total = special_repository.list_admin(pagination.limit, pagination.offset)
    return Page(items=items, total=total, limit=pagination.limit, offset=pagination.offset)


@router.get("/{special_id}", response_model=SpecialOut)
def get_special(special_id: str, admin: CurrentAdmin = Depends(get_current_admin)):
    return special_repository.get(special_id)


@router.post("", response_model=SpecialOut, status_code=201)
def create_special(payload: SpecialCreate, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))):
    return special_repository.create(payload.model_dump(mode="json"))


@router.patch("/{special_id}", response_model=SpecialOut)
def update_special(
    special_id: str, payload: SpecialUpdate, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))
):
    return special_repository.update(special_id, payload.model_dump(mode="json", exclude_none=True))


@router.delete("/{special_id}", status_code=204)
def delete_special(special_id: str, admin: CurrentAdmin = Depends(require_role("owner", "admin"))):
    special_repository.delete(special_id)
