from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentAdmin, get_current_admin, require_role
from app.repositories import category_repository
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate
from app.schemas.common import Page, PaginationParams

router = APIRouter(prefix="/admin/categories", tags=["admin-categories"])


@router.get("", response_model=Page[CategoryOut])
def list_categories(pagination: PaginationParams = Depends(), admin: CurrentAdmin = Depends(get_current_admin)):
    items, total = category_repository.list_admin(pagination.limit, pagination.offset)
    return Page(items=items, total=total, limit=pagination.limit, offset=pagination.offset)


@router.get("/{category_id}", response_model=CategoryOut)
def get_category(category_id: str, admin: CurrentAdmin = Depends(get_current_admin)):
    return category_repository.get(category_id)


@router.post("", response_model=CategoryOut, status_code=201)
def create_category(payload: CategoryCreate, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))):
    return category_repository.create(payload.model_dump())


@router.patch("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: str, payload: CategoryUpdate, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))
):
    fields = payload.model_dump(exclude_none=True)
    return category_repository.update(category_id, fields)


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: str, admin: CurrentAdmin = Depends(require_role("owner", "admin"))):
    category_repository.delete(category_id)
