"""Manual Instagram Reel management for the admin panel — an admin pastes the
Reel URL and uploads a cover image themselves; nothing here talks to
Instagram's API (see app/repositories/instagram_repository.py header)."""

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentAdmin, get_current_admin, require_role
from app.db import get_supabase
from app.repositories import instagram_repository, media_repository
from app.schemas.common import Page, PaginationParams
from app.schemas.instagram_post import InstagramPostCreate, InstagramPostOut, InstagramPostUpdate

router = APIRouter(prefix="/admin/instagram-posts", tags=["admin-instagram"])


def _resolve_media_url(media_id: str) -> str:
    media_row = media_repository.get(media_id)
    return get_supabase().storage.from_(media_row["bucket"]).get_public_url(media_row["storage_path"])


@router.get("", response_model=Page[InstagramPostOut])
def list_instagram_posts(pagination: PaginationParams = Depends(), admin: CurrentAdmin = Depends(get_current_admin)):
    items, total = instagram_repository.list_admin(pagination.limit, pagination.offset)
    return Page(items=items, total=total, limit=pagination.limit, offset=pagination.offset)


@router.post("", response_model=InstagramPostOut, status_code=201)
def create_instagram_post(
    payload: InstagramPostCreate, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))
):
    fields = {
        "instagram_media_id": f"manual-{uuid4()}",
        "permalink": payload.permalink,
        "caption": payload.caption,
        "media_url": _resolve_media_url(payload.media_id),
        "media_type": "REELS",
        "is_reel": True,
        "posted_at": datetime.now(timezone.utc).isoformat(),
    }
    return instagram_repository.create(fields)


@router.patch("/{post_id}", response_model=InstagramPostOut)
def update_instagram_post(
    post_id: str,
    payload: InstagramPostUpdate,
    admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor")),
):
    fields = payload.model_dump(exclude_none=True, exclude={"media_id"})
    if payload.media_id:
        fields["media_url"] = _resolve_media_url(payload.media_id)
    return instagram_repository.update(post_id, fields)


@router.delete("/{post_id}", status_code=204)
def delete_instagram_post(post_id: str, admin: CurrentAdmin = Depends(require_role("owner", "admin"))):
    instagram_repository.delete(post_id)
