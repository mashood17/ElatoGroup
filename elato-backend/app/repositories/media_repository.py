from typing import Any

from app.repositories.base import client, unwrap_single

TABLE = "media"


def create(fields: dict[str, Any]) -> dict[str, Any]:
    res = client().table(TABLE).insert(fields).execute()
    return unwrap_single(res.data, "Media row not created")


def get(media_id: str) -> dict[str, Any]:
    res = client().table(TABLE).select("*").eq("id", media_id).limit(1).execute()
    return unwrap_single(res.data, "Media not found")


def list_all(limit: int, offset: int, bucket: str | None) -> tuple[list[dict[str, Any]], int]:
    query = client().table(TABLE).select("*", count="exact")
    if bucket:
        query = query.eq("bucket", bucket)
    res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return res.data, res.count or 0


def delete(media_id: str) -> None:
    client().table(TABLE).delete().eq("id", media_id).execute()
