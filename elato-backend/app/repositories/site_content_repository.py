from datetime import datetime, timezone
from typing import Any

from postgrest.exceptions import APIError

from app.repositories.base import client, raise_for_postgrest, unwrap_single

TABLE = "site_content"


def get(key: str) -> dict[str, Any]:
    res = client().table(TABLE).select("*").eq("key", key).limit(1).execute()
    return unwrap_single(res.data, f"site_content key '{key}' not found")


def list_all() -> list[dict[str, Any]]:
    res = client().table(TABLE).select("*").execute()
    return res.data


def upsert(key: str, value: Any, updated_by: str) -> dict[str, Any]:
    try:
        res = (
            client()
            .table(TABLE)
            .upsert(
                {
                    "key": key,
                    # The column is NOT NULL — "cleared" (e.g. removing a
                    # SectionImageCard's image) is stored as {} rather than
                    # SQL null, which the DB would reject.
                    "value": value if value is not None else {},
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "updated_by": updated_by,
                }
            )
            .execute()
        )
    except APIError as exc:
        raise_for_postgrest(exc)
    return unwrap_single(res.data, "site_content not saved")
