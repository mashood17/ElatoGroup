from typing import Any

from app.repositories.base import client, unwrap_single

TABLE = "menu_items"


def list_public(category_id: str | None, is_available: bool | None) -> list[dict[str, Any]]:
    query = client().table(TABLE).select("*")
    if category_id:
        query = query.eq("category_id", category_id)
    query = query.eq("is_available", is_available if is_available is not None else True)
    res = query.order("display_order").execute()
    return res.data


def list_admin(limit: int, offset: int, category_id: str | None) -> tuple[list[dict[str, Any]], int]:
    query = client().table(TABLE).select("*", count="exact")
    if category_id:
        query = query.eq("category_id", category_id)
    res = query.order("display_order").range(offset, offset + limit - 1).execute()
    return res.data, res.count or 0


def get(item_id: str) -> dict[str, Any]:
    res = client().table(TABLE).select("*").eq("id", item_id).limit(1).execute()
    return unwrap_single(res.data, "Menu item not found")


def create(fields: dict[str, Any]) -> dict[str, Any]:
    res = client().table(TABLE).insert(fields).execute()
    return unwrap_single(res.data, "Menu item not created")


def update(item_id: str, fields: dict[str, Any]) -> dict[str, Any]:
    res = client().table(TABLE).update(fields).eq("id", item_id).execute()
    return unwrap_single(res.data, "Menu item not found")


def delete(item_id: str) -> None:
    client().table(TABLE).delete().eq("id", item_id).execute()


def count_all() -> int:
    res = client().table(TABLE).select("id", count="exact").execute()
    return res.count or 0
