from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentAdmin, get_current_admin, require_role
from app.repositories import menu_item_repository
from app.schemas.common import Page, PaginationParams
from app.schemas.menu_item import MenuItemCreate, MenuItemOut, MenuItemUpdate
from app.services import media_service

router = APIRouter(prefix="/admin/menu-items", tags=["admin-menu-items"])


@router.get("", response_model=Page[MenuItemOut])
def list_menu_items(
    category_id: str | None = None,
    pagination: PaginationParams = Depends(),
    admin: CurrentAdmin = Depends(get_current_admin),
):
    items, total = menu_item_repository.list_admin(pagination.limit, pagination.offset, category_id)
    return Page(items=items, total=total, limit=pagination.limit, offset=pagination.offset)


@router.get("/{item_id}", response_model=MenuItemOut)
def get_menu_item(item_id: str, admin: CurrentAdmin = Depends(get_current_admin)):
    return menu_item_repository.get(item_id)


@router.post("", response_model=MenuItemOut, status_code=201)
def create_menu_item(payload: MenuItemCreate, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))):
    return menu_item_repository.create(payload.model_dump())


@router.patch("/{item_id}", response_model=MenuItemOut)
def update_menu_item(
    item_id: str, payload: MenuItemUpdate, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))
):
    fields = payload.model_dump(exclude_none=True)
    return media_service.update_with_image_cleanup(
        menu_item_repository.get, menu_item_repository.update, item_id, fields, "image_id"
    )


@router.delete("/{item_id}", status_code=204)
def delete_menu_item(item_id: str, admin: CurrentAdmin = Depends(require_role("owner", "admin"))):
    menu_item_repository.delete(item_id)
