from datetime import datetime, timezone
from typing import Any

from app.repositories.base import client, unwrap_single

TABLE = "offers"


def list_all() -> list[dict[str, Any]]:
    res = client().table(TABLE).select("*").order("created_at", desc=True).execute()
    return res.data


def get(offer_id: str) -> dict[str, Any]:
    res = client().table(TABLE).select("*").eq("id", offer_id).limit(1).execute()
    return unwrap_single(res.data, "Offer not found")


def get_active() -> dict[str, Any] | None:
    res = client().table(TABLE).select("*").eq("is_active", True).limit(1).execute()
    return res.data[0] if res.data else None


def create(fields: dict[str, Any]) -> dict[str, Any]:
    res = client().table(TABLE).insert(fields).execute()
    return unwrap_single(res.data, "Offer not created")


def update(offer_id: str, fields: dict[str, Any]) -> dict[str, Any]:
    payload = {**fields, "updated_at": datetime.now(timezone.utc).isoformat()}
    res = client().table(TABLE).update(payload).eq("id", offer_id).execute()
    return unwrap_single(res.data, "Offer not found")


def delete(offer_id: str) -> None:
    client().table(TABLE).delete().eq("id", offer_id).execute()


def deactivate_all() -> None:
    """Turns off whichever offer is currently active (if any) — the
    prerequisite step before activating a different one, since is_active has
    a single-row partial unique index."""
    client().table(TABLE).update(
        {"is_active": False, "updated_at": datetime.now(timezone.utc).isoformat()}
    ).eq("is_active", True).execute()


def set_active(offer_id: str) -> dict[str, Any]:
    deactivate_all()
    return update(offer_id, {"is_active": True})
