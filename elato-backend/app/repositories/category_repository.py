from typing import Any

from app.repositories.base import client, unwrap_single

TABLE = "categories"


def list_public() -> list[dict[str, Any]]:
    res = client().table(TABLE).select("*").eq("is_active", True).order("display_order").execute()
    return res.data


def list_admin(limit: int, offset: int) -> tuple[list[dict[str, Any]], int]:
    res = (
        client()
        .table(TABLE)
        .select("*", count="exact")
        .order("display_order")
        .range(offset, offset + limit - 1)
        .execute()
    )
    return res.data, res.count or 0


def get(category_id: str) -> dict[str, Any]:
    res = client().table(TABLE).select("*").eq("id", category_id).limit(1).execute()
    return unwrap_single(res.data, "Category not found")


def create(fields: dict[str, Any]) -> dict[str, Any]:
    res = client().table(TABLE).insert(fields).execute()
    return unwrap_single(res.data, "Category not created")


def update(category_id: str, fields: dict[str, Any]) -> dict[str, Any]:
    res = client().table(TABLE).update(fields).eq("id", category_id).execute()
    return unwrap_single(res.data, "Category not found")


def delete(category_id: str) -> None:
    client().table(TABLE).delete().eq("id", category_id).execute()
