from datetime import datetime, timezone
from typing import Any

from app.repositories.base import client, unwrap_single

TABLE = "settings"


def get(key: str) -> dict[str, Any]:
    res = client().table(TABLE).select("*").eq("key", key).limit(1).execute()
    return unwrap_single(res.data, f"setting '{key}' not found")


def list_all() -> list[dict[str, Any]]:
    res = client().table(TABLE).select("*").execute()
    return res.data


def upsert(key: str, value: Any) -> dict[str, Any]:
    res = (
        client()
        .table(TABLE)
        .upsert({"key": key, "value": value, "updated_at": datetime.now(timezone.utc).isoformat()})
        .execute()
    )
    return unwrap_single(res.data, "setting not saved")
