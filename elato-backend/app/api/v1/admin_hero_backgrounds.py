from typing import Any

from fastapi import APIRouter, Depends, File, UploadFile

from app.core.dependencies import CurrentAdmin, get_current_admin, require_role
from app.repositories import hero_background_repository
from app.schemas.hero_background import HeroBackgroundOut
from app.services import hero_video_service

router = APIRouter(prefix="/admin/hero-backgrounds", tags=["admin-hero-backgrounds"])


@router.get("", response_model=list[HeroBackgroundOut])
def list_hero_backgrounds(admin: CurrentAdmin = Depends(get_current_admin)):
    return [_to_out(row) for row in hero_background_repository.list_all()]


@router.post("/{slot}/video", response_model=HeroBackgroundOut, status_code=201)
async def upload_video(
    slot: str,
    file: UploadFile = File(...),
    admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor")),
):
    row = await hero_video_service.upload_hero_video(file, slot, admin.id)
    return _to_out(row)


@router.post("/{slot}/poster", response_model=HeroBackgroundOut)
async def upload_poster(
    slot: str,
    file: UploadFile = File(...),
    admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor")),
):
    row = await hero_video_service.upload_hero_poster(file, slot, admin.id)
    return _to_out(row)


@router.delete("/{slot}", status_code=204)
def delete_hero_background(slot: str, admin: CurrentAdmin = Depends(require_role("owner", "admin"))):
    hero_video_service.delete_hero_video(slot)


def _to_out(row: dict[str, Any]) -> HeroBackgroundOut:
    return hero_video_service.to_schema(row)
