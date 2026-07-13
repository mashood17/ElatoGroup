from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentAdmin, get_current_admin, require_role
from app.repositories import site_content_repository
from app.schemas.site_content import SiteContentOut, SiteContentUpsert

router = APIRouter(prefix="/admin/site-content", tags=["admin-site-content"])


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
    return site_content_repository.upsert(key, payload.value, admin.id)
