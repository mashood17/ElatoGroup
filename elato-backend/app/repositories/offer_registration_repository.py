from datetime import datetime, timezone
from typing import Any

from postgrest.exceptions import APIError

from app.core.exceptions import AppError
from app.repositories.base import client, unwrap_single

TABLE = "offer_registrations"

_DUPLICATE_MESSAGE = "This phone number has already registered for the current offer."


def create(fields: dict[str, Any]) -> dict[str, Any]:
    try:
        res = client().table(TABLE).insert(fields).execute()
    except APIError as exc:
        # Belt-and-suspenders against the exists_for_offer_and_phone
        # pre-check's race window: two near-simultaneous submissions for the
        # same offer+phone both pass the pre-check, but the unique index
        # (offer_id, country_code, phone_number) lets only one INSERT
        # succeed — the loser lands here instead of a raw 500.
        if (getattr(exc, "code", None) or "") == "23505":
            raise AppError(code="duplicate_registration", message=_DUPLICATE_MESSAGE, status_code=409) from exc
        raise
    return unwrap_single(res.data, "Registration not created")


def get(registration_id: str) -> dict[str, Any]:
    res = client().table(TABLE).select("*").eq("id", registration_id).limit(1).execute()
    return unwrap_single(res.data, "Registration not found")


def exists_for_offer_and_phone(offer_id: str, country_code: str, phone_number: str) -> bool:
    res = (
        client()
        .table(TABLE)
        .select("id")
        .eq("offer_id", offer_id)
        .eq("country_code", country_code)
        .eq("phone_number", phone_number)
        .limit(1)
        .execute()
    )
    return len(res.data) > 0


def exists_for_offer_and_visitor(offer_id: str, visitor_id: str) -> bool:
    res = (
        client()
        .table(TABLE)
        .select("id")
        .eq("offer_id", offer_id)
        .eq("visitor_id", visitor_id)
        .limit(1)
        .execute()
    )
    return len(res.data) > 0


def search(
    limit: int,
    offset: int,
    query: str | None,
    offer_id: str | None,
    country_code: str | None,
    status: str | None,
    date_from: str | None,
    date_to: str | None,
) -> tuple[list[dict[str, Any]], int]:
    q = client().table(TABLE).select("*", count="exact")
    if query:
        # Sanitize: commas/percent signs would otherwise break the or_()
        # filter-string syntax or the ilike wildcard itself.
        safe = query.strip().replace(",", " ").replace("%", "")
        if safe:
            q = q.or_(f"name.ilike.%{safe}%,phone_number.ilike.%{safe}%")
    if offer_id:
        q = q.eq("offer_id", offer_id)
    if country_code:
        q = q.eq("country_code", country_code)
    if status:
        q = q.eq("status", status)
    if date_from:
        q = q.gte("created_at", date_from)
    if date_to:
        q = q.lte("created_at", date_to)
    res = q.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return res.data, res.count or 0


def mark_redeemed(registration_id: str, redeemed_by: str, notes: str | None) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "status": "redeemed",
        "redeemed_at": datetime.now(timezone.utc).isoformat(),
        "redeemed_by": redeemed_by,
    }
    if notes is not None:
        payload["notes"] = notes
    res = client().table(TABLE).update(payload).eq("id", registration_id).execute()
    return unwrap_single(res.data, "Registration not found")
