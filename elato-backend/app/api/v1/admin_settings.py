from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentAdmin, get_current_admin, require_role
from app.repositories import settings_repository
from app.schemas.settings import SettingOut, SettingUpsert

router = APIRouter(prefix="/admin/settings", tags=["admin-settings"])


@router.get("", response_model=list[SettingOut])
def list_settings(admin: CurrentAdmin = Depends(get_current_admin)):
    return settings_repository.list_all()


@router.put("/{key}", response_model=SettingOut)
def upsert_setting(key: str, payload: SettingUpsert, admin: CurrentAdmin = Depends(require_role("owner", "admin"))):
    return settings_repository.upsert(key, payload.value)
