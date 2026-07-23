from typing import Any

from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentAdmin, get_current_admin, require_role
from app.repositories import site_content_repository
from app.schemas.site_content import SiteContentOut, SiteContentUpsert
from app.services import media_service

router = APIRouter(prefix="/admin/site-content", tags=["admin-site-content"])


def _media_id_of(value: Any) -> str | None:
    """site_content.value is freeform jsonb — most keys aren't images at all.
    Only the SectionImageCard shape (`{media_id, url}`, see elato-admin's
    SectionImageCard.tsx) carries an image reference; every other key's value
    just yields None here, making cleanup below a no-op for them."""
    return value.get("media_id") if isinstance(value, dict) else None


@router.get("", response_model=list[SiteContentOut])
def list_site_content(admin: CurrentAdmin = Depends(get_current_admin)):
    return site_content_repository.list_all()


@router.get("/{key}", response_model=SiteContentOut)
def get_site_content(key: str, admin: CurrentAdmin = Depends(get_current_admin)):
    return site_content_repository.get(key)


@router.put("/{key}", response_model=SiteContentOut)
def upsert_site_content(
    key: str, payload: SiteContentUpsert, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))
):
    old_media_id = None
    try:
        old_media_id = _media_id_of(site_content_repository.get(key)["value"])
    except Exception:
        pass

    updated = site_content_repository.upsert(key, payload.value, admin.id)

    media_service.cleanup_replaced_image(old_media_id, _media_id_of(payload.value))
    return updated
