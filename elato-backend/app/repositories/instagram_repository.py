"""Instagram Reels cache, synced from the Meta Graph API on a schedule (see
app/services/instagram_service.py) plus POST /admin/instagram/sync. A
handful of rows predate the sync and were created by hand through the old
admin form — those keep import_status='manual' and are never touched by
upsert_many/prune_missing, so they keep rendering on the public site
alongside auto-synced reels indefinitely."""

from typing import Any

from app.repositories.base import client, unwrap_single

TABLE = "instagram_posts"
STATUS_TABLE = "instagram_sync_status"
STATUS_ROW_ID = True  # instagram_sync_status is a singleton keyed on id=true

_SELECT_COLUMNS = "id,media_type,is_reel,thumbnail_url,media_url,video_url,permalink,caption,posted_at,import_status,synced_at"


def list_latest(cap: int = 8) -> list[dict[str, Any]]:
    res = (
        client()
        .table(TABLE)
        .select(_SELECT_COLUMNS)
        .eq("is_reel", True)
        .order("posted_at", desc=True)
        .limit(cap)
        .execute()
    )
    return res.data


def list_synced_media(media_ids: list[str]) -> dict[str, dict[str, Any]]:
    """Existing synced rows for the given Instagram media ids, keyed by
    instagram_media_id — lets the sync job skip re-downloading/re-uploading
    media it already has a hosted copy of."""
    if not media_ids:
        return {}
    res = (
        client()
        .table(TABLE)
        .select("instagram_media_id,video_url,thumbnail_url,media_url")
        .eq("import_status", "synced")
        .in_("instagram_media_id", media_ids)
        .execute()
    )
    return {row["instagram_media_id"]: row for row in res.data}


def upsert_many(rows: list[dict[str, Any]]) -> None:
    """Insert new reels / refresh existing ones by `instagram_media_id` — a
    re-run of the sync never creates a duplicate row for the same media."""
    if not rows:
        return
    client().table(TABLE).upsert(rows, on_conflict="instagram_media_id").execute()


def prune_missing(active_media_ids: list[str]) -> None:
    """Removes previously-synced reels Instagram no longer returns (deleted,
    or aged out of the synced window). Only ever touches import_status='synced'
    rows — manually-created legacy rows are never pruned by a sync run."""
    c = client()
    query = c.table(TABLE).delete().eq("import_status", "synced")
    if active_media_ids:
        query = query.not_.in_("instagram_media_id", active_media_ids)
    query.execute()


def list_admin(limit: int, offset: int) -> tuple[list[dict[str, Any]], int]:
    res = (
        client()
        .table(TABLE)
        .select("*", count="exact")
        .order("posted_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return res.data, res.count or 0


def count_reels() -> int:
    res = client().table(TABLE).select("id", count="exact").eq("is_reel", True).execute()
    return res.count or 0


def get_sync_status() -> dict[str, Any] | None:
    res = client().table(STATUS_TABLE).select("*").eq("id", STATUS_ROW_ID).limit(1).execute()
    return res.data[0] if res.data else None


def upsert_sync_status(fields: dict[str, Any]) -> dict[str, Any]:
    row = {**fields, "id": STATUS_ROW_ID}
    res = client().table(STATUS_TABLE).upsert(row, on_conflict="id").execute()
    return unwrap_single(res.data, "Instagram sync status not created")
