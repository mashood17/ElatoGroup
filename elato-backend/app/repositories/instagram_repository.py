from typing import Any

from app.repositories.base import client

TABLE = "instagram_posts"


def list_latest(cap: int = 8) -> list[dict[str, Any]]:
    res = client().table(TABLE).select("*").order("posted_at", desc=True).limit(cap).execute()
    return res.data


def replace_all(rows: list[dict[str, Any]]) -> None:
    """Used by the Instagram sync job — clears the cache table and re-inserts
    the latest batch, since Instagram is the source of truth, not this cache."""
    c = client()
    c.table(TABLE).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    if rows:
        c.table(TABLE).insert(rows).execute()
