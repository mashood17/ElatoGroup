"""Password-reset tokens, backed by `password_reset_tokens` (migration 0002)."""

import hashlib
from datetime import datetime, timezone
from typing import Any

from app.repositories.base import client

TABLE = "password_reset_tokens"


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def store(admin_id: str, token: str, expires_at: datetime) -> None:
    client().table(TABLE).insert(
        {"admin_id": admin_id, "token_hash": _hash(token), "expires_at": expires_at.isoformat()}
    ).execute()


def find_valid(token: str) -> dict[str, Any] | None:
    res = (
        client()
        .table(TABLE)
        .select("*")
        .eq("token_hash", _hash(token))
        .is_("used_at", "null")
        .gt("expires_at", datetime.now(timezone.utc).isoformat())
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


def mark_used(token: str) -> None:
    client().table(TABLE).update({"used_at": datetime.now(timezone.utc).isoformat()}).eq(
        "token_hash", _hash(token)
    ).execute()
