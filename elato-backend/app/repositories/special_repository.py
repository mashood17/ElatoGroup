from datetime import date
from typing import Any

from postgrest.exceptions import APIError

from app.repositories.base import client, raise_for_postgrest, unwrap_single

TABLE = "specials"


def list_public() -> list[dict[str, Any]]:
    today = date.today().isoformat()
    try:
        res = client().table(TABLE).select("*").eq("is_active", True).order("display_order").execute()
    except APIError as exc:
        raise_for_postgrest(exc)
    # active_from/active_to windows are nullable — filter in Python since
    # PostgREST "or" with null-or-lte across two columns is awkward to compose safely.
    items = [
        row
        for row in res.data
        if (row.get("active_from") is None or row["active_from"] <= today)
        and (row.get("active_to") is None or row["active_to"] >= today)
    ]
    return items


def list_admin(limit: int, offset: int) -> tuple[list[dict[str, Any]], int]:
    res = client().table(TABLE).select("*", count="exact").order("display_order").range(
        offset, offset + limit - 1
    ).execute()
    return res.data, res.count or 0


def get(special_id: str) -> dict[str, Any]:
    res = client().table(TABLE).select("*").eq("id", special_id).limit(1).execute()
    return unwrap_single(res.data, "Special not found")


def create(fields: dict[str, Any]) -> dict[str, Any]:
    res = client().table(TABLE).insert(fields).execute()
    return unwrap_single(res.data, "Special not created")


def update(special_id: str, fields: dict[str, Any]) -> dict[str, Any]:
    res = client().table(TABLE).update(fields).eq("id", special_id).execute()
    return unwrap_single(res.data, "Special not found")


def delete(special_id: str) -> None:
    client().table(TABLE).delete().eq("id", special_id).execute()
