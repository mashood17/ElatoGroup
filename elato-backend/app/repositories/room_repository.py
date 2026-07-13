from typing import Any

from app.repositories.base import client, unwrap_single

TABLE = "rooms"


def list_public() -> list[dict[str, Any]]:
    res = client().table(TABLE).select("*").eq("is_active", True).execute()
    return res.data


def list_admin(limit: int, offset: int) -> tuple[list[dict[str, Any]], int]:
    res = client().table(TABLE).select("*", count="exact").range(offset, offset + limit - 1).execute()
    return res.data, res.count or 0


def get(room_id: str) -> dict[str, Any]:
    res = client().table(TABLE).select("*").eq("id", room_id).limit(1).execute()
    return unwrap_single(res.data, "Room not found")


def create(fields: dict[str, Any]) -> dict[str, Any]:
    res = client().table(TABLE).insert(fields).execute()
    return unwrap_single(res.data, "Room not created")


def update(room_id: str, fields: dict[str, Any]) -> dict[str, Any]:
    res = client().table(TABLE).update(fields).eq("id", room_id).execute()
    return unwrap_single(res.data, "Room not found")


def delete(room_id: str) -> None:
    client().table(TABLE).delete().eq("id", room_id).execute()
