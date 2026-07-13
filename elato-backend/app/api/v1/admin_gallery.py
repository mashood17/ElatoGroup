from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentAdmin, get_current_admin, require_role
from app.repositories import gallery_repository
from app.schemas.common import Page, PaginationParams
from app.schemas.gallery import GalleryItemCreate, GalleryItemOut, GalleryItemUpdate

router = APIRouter(prefix="/admin/gallery", tags=["admin-gallery"])


@router.get("", response_model=Page[GalleryItemOut])
def list_gallery(pagination: PaginationParams = Depends(), admin: CurrentAdmin = Depends(get_current_admin)):
    rows, total = gallery_repository.list_admin(pagination.limit, pagination.offset)
    items = []
    for row in rows:
        media = row.pop("media", None) or {}
        items.append(GalleryItemOut(**row, media_url=media.get("storage_path")))
    return Page(items=items, total=total, limit=pagination.limit, offset=pagination.offset)


@router.get("/{item_id}", response_model=GalleryItemOut)
def get_gallery_item(item_id: str, admin: CurrentAdmin = Depends(get_current_admin)):
    return gallery_repository.get(item_id)


@router.post("", response_model=GalleryItemOut, status_code=201)
def create_gallery_item(payload: GalleryItemCreate, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))):
    return gallery_repository.create(payload.model_dump())


@router.patch("/{item_id}", response_model=GalleryItemOut)
def update_gallery_item(
    item_id: str, payload: GalleryItemUpdate, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))
):
    return gallery_repository.update(item_id, payload.model_dump(exclude_none=True))


@router.delete("/{item_id}", status_code=204)
def delete_gallery_item(item_id: str, admin: CurrentAdmin = Depends(require_role("owner", "admin"))):
    gallery_repository.delete(item_id)
