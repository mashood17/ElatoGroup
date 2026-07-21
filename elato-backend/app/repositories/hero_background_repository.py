from datetime import datetime, timezone
from typing import Any

from app.repositories.base import client

TABLE = "hero_backgrounds"


def get_by_slot(slot: str) -> dict[str, Any] | None:
    res = client().table(TABLE).select("*").eq("slot", slot).limit(1).execute()
    return res.data[0] if res.data else None


def list_all() -> list[dict[str, Any]]:
    res = client().table(TABLE).select("*").order("slot").execute()
    return res.data


def upsert(slot: str, fields: dict[str, Any]) -> dict[str, Any]:
    payload = {**fields, "slot": slot, "updated_at": datetime.now(timezone.utc).isoformat()}
    res = client().table(TABLE).upsert(payload, on_conflict="slot").execute()
    return res.data[0]


def delete(slot: str) -> None:
    client().table(TABLE).delete().eq("slot", slot).execute()
