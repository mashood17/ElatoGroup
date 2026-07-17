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


def recent_grouped_by_name(limit: int = 8, scan: int = 200) -> list[dict[str, Any]]:
    """Most recently-seen distinct event names, each with its total count and
    last-seen timestamp — scans the most recent `scan` raw events rather than
    the whole table, grouping in Python since this is a small admin widget,
    not a reporting query."""
    res = (
        client()
        .table(TABLE)
        .select("event_name,created_at")
        .order("created_at", desc=True)
        .limit(scan)
        .execute()
    )
    groups: dict[str, dict[str, Any]] = {}
    for row in res.data:
        name = row["event_name"]
        if name not in groups:
            groups[name] = {"event_name": name, "count": 0, "last_seen": row["created_at"]}
        groups[name]["count"] += 1
    ordered = sorted(groups.values(), key=lambda g: g["last_seen"], reverse=True)
    return ordered[:limit]
