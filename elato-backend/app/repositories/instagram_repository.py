"""Instagram Reels cache — synced from the Graph API on a schedule (see
app/services/instagram_service.py). The public API only ever reads this
table; nothing here talks to Instagram directly."""

from typing import Any

from app.repositories.base import client

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
