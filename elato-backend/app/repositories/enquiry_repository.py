from typing import Any

from app.repositories.base import client, unwrap_single

TABLE = "enquiries"


def create(fields: dict[str, Any]) -> dict[str, Any]:
    res = client().table(TABLE).insert(fields).execute()
    return unwrap_single(res.data, "Enquiry not created")


def list_admin(limit: int, offset: int, status: str | None) -> tuple[list[dict[str, Any]], int]:
    query = client().table(TABLE).select("*", count="exact")
    if status:
        query = query.eq("status", status)
    res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return res.data, res.count or 0

def update_status(enquiry_id: str, status: str) -> dict[str, Any]:
    res = client().table(TABLE).update({"status": status}).eq("id", enquiry_id).execute()
    return unwrap_single(res.data, "Enquiry not found")


def count_all() -> int:
    res = client().table(TABLE).select("id", count="exact").execute()
    return res.count or 0


def count_new() -> int:
    res = client().table(TABLE).select("id", count="exact").eq("status", "new").execute()
    return res.count or 0


def list_recent(limit: int = 5) -> list[dict[str, Any]]:
    res = client().table(TABLE).select("*").order("created_at", desc=True).limit(limit).execute()
    return res.data
