from typing import Any

from app.repositories.base import client, unwrap_single

TABLE = "event_packages"


def list_public() -> list[dict[str, Any]]:
    res = client().table(TABLE).select("*").eq("is_active", True).order("display_order").execute()
    return res.data


def list_admin(limit: int, offset: int) -> tuple[list[dict[str, Any]], int]:
    res = client().table(TABLE).select("*", count="exact").order("display_order").range(
        offset, offset + limit - 1
    ).execute()
    return res.data, res.count or 0


def get(package_id: str) -> dict[str, Any]:
    res = client().table(TABLE).select("*").eq("id", package_id).limit(1).execute()
    return unwrap_single(res.data, "Event package not found")


def create(fields: dict[str, Any]) -> dict[str, Any]:
    res = client().table(TABLE).insert(fields).execute()
    return unwrap_single(res.data, "Event package not created")


def update(package_id: str, fields: dict[str, Any]) -> dict[str, Any]:
    res = client().table(TABLE).update(fields).eq("id", package_id).execute()
    return unwrap_single(res.data, "Event package not found")


def delete(package_id: str) -> None:
    client().table(TABLE).delete().eq("id", package_id).execute()
