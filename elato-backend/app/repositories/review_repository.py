from typing import Any

from app.repositories.base import client, unwrap_single
from app.repositories import settings_repository

TABLE = "reviews"
AGGREGATE_SETTINGS_KEY = "reviews_aggregate"


def list_featured() -> list[dict[str, Any]]:
    res = client().table(TABLE).select("*").eq("is_featured", True).order("fetched_at", desc=True).execute()
    return res.data


def list_admin(limit: int, offset: int) -> tuple[list[dict[str, Any]], int]:
    res = client().table(TABLE).select("*", count="exact").order("fetched_at", desc=True).range(
        offset, offset + limit - 1
    ).execute()
    return res.data, res.count or 0


def update(review_id: str, fields: dict[str, Any]) -> dict[str, Any]:
    res = client().table(TABLE).update(fields).eq("id", review_id).execute()
    return unwrap_single(res.data, "Review not found")


def upsert_from_source(rows: list[dict[str, Any]]) -> None:
    """Used by the Google Places sync job — dedupes on (source, author_name, text)."""
    if not rows:
        return
    client().table(TABLE).insert(rows).execute()


def count_all() -> int:
    res = client().table(TABLE).select("id", count="exact").execute()
    return res.count or 0


def get_aggregate() -> dict[str, Any]:
    """Business-wide Google rating/count — seeded with real numbers by
    migration 0006, kept current by the Places sync (reviews_service) once
    GOOGLE_PLACES_API_KEY/GOOGLE_PLACE_ID are configured."""
    row = settings_repository.get(AGGREGATE_SETTINGS_KEY)
    return row["value"]
