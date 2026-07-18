"""Instagram Integration admin endpoints — read-only connection/sync status
plus a manual "Sync Now" trigger. Reels are never created or edited here;
they come exclusively from the Meta Graph API sync
(app/services/instagram_service.py) and this router just surfaces its
state and lets an admin re-run it on demand."""

from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentAdmin, get_current_admin, require_role
from app.repositories import instagram_repository
from app.schemas.common import Page, PaginationParams
from app.schemas.instagram_post import InstagramPostOut, InstagramSyncStatusOut
from app.services import instagram_service

router = APIRouter(prefix="/admin/instagram", tags=["admin-instagram"])


def _status_out() -> InstagramSyncStatusOut:
    row = instagram_repository.get_sync_status()
    if not row:
        return InstagramSyncStatusOut(connected=False, imported_reels_count=instagram_repository.count_reels())
    return InstagramSyncStatusOut(
        # A username is only ever recorded after a successful Graph API
        # account lookup, so its presence is the real "credentials work"
        # signal — independent of whether the *latest* run happened to fail.
        connected=bool(row.get("connected_account_username")),
        account_username=row.get("connected_account_username"),
        last_synced_at=row.get("last_synced_at"),
        last_sync_status=row.get("last_sync_status"),
        last_sync_error=row.get("last_sync_error"),
        imported_reels_count=row.get("imported_reels_count") or 0,
        auto_sync_enabled=row.get("auto_sync_enabled") or False,
    )


@router.get("/status", response_model=InstagramSyncStatusOut)
def get_status(admin: CurrentAdmin = Depends(get_current_admin)):
    return _status_out()


@router.post("/sync", response_model=InstagramSyncStatusOut)
async def sync_now(admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))):
    await instagram_service.sync_instagram_posts()
    return _status_out()


@router.get("/reels", response_model=Page[InstagramPostOut])
def list_reels(pagination: PaginationParams = Depends(), admin: CurrentAdmin = Depends(get_current_admin)):
    items, total = instagram_repository.list_admin(pagination.limit, pagination.offset)
    return Page(items=items, total=total, limit=pagination.limit, offset=pagination.offset)
