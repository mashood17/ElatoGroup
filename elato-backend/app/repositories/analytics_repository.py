from datetime import datetime, timedelta, timezone
from typing import Any

from app.repositories.base import client

TABLE = "analytics_events"


def create(fields: dict[str, Any]) -> None:
    client().table(TABLE).insert(fields).execute()


def counts_by_event_last_n_days(days: int = 30) -> dict[str, int]:
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    res = client().table(TABLE).select("event_name").gte("created_at", since).execute()
    counts: dict[str, int] = {}
    for row in res.data:
        name = row["event_name"]
        counts[name] = counts.get(name, 0) + 1
    return counts
