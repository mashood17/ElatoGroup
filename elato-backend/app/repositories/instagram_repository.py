"""Instagram Reels cache — historically synced from the Graph API on a
schedule (see app/services/instagram_service.py). The admin panel now manages
rows manually instead (paste a Reel URL, upload a cover image) — the sync
functions below (`upsert_many`/`prune_missing`) are left in place but are no
longer wired to any admin route; the `list_admin`/`create`/`update`/`delete`
functions are the ones the manual-entry admin UI actually uses."""

from typing import Any

from app.repositories.base import client, unwrap_single

TABLE = "instagram_posts"

_SELECT_COLUMNS = "id,media_type,is_reel,thumbnail_url,media_url,permalink,caption,posted_at"


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


def upsert_many(rows: list[dict[str, Any]]) -> None:
    """Insert new reels / refresh existing ones by `instagram_media_id` — a
    re-run of the sync never creates a duplicate row for the same media."""
    if not rows:
        return
    client().table(TABLE).upsert(rows, on_conflict="instagram_media_id").execute()


def prune_missing(active_media_ids: list[str]) -> None:
    """Removes cached reels Instagram no longer returns (deleted, or aged out
    of the synced window) — only called after a successful fetch, so an empty
    `active_media_ids` here means the account genuinely has zero reels now."""
    c = client()
    if not active_media_ids:
        c.table(TABLE).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        return
    c.table(TABLE).delete().not_.in_("instagram_media_id", active_media_ids).execute()


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


def get(post_id: str) -> dict[str, Any]:
    res = client().table(TABLE).select("*").eq("id", post_id).limit(1).execute()
    return unwrap_single(res.data, "Instagram post not found")


def create(fields: dict[str, Any]) -> dict[str, Any]:
    res = client().table(TABLE).insert(fields).execute()
    return unwrap_single(res.data, "Instagram post not created")


def update(post_id: str, fields: dict[str, Any]) -> dict[str, Any]:
    res = client().table(TABLE).update(fields).eq("id", post_id).execute()
    return unwrap_single(res.data, "Instagram post not found")


def delete(post_id: str) -> None:
    client().table(TABLE).delete().eq("id", post_id).execute()


def count_all() -> int:
    res = client().table(TABLE).select("id", count="exact").execute()
    return res.count or 0
