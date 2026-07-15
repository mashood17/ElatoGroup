"""
Instagram Graph API sync — pulls the latest Reels from the configured
Instagram Business Account, upserts them into the `instagram_posts` cache
keyed on `instagram_media_id` (so re-running never duplicates a row), and
prunes any cached reel Instagram no longer returns.

Requires INSTAGRAM_GRAPH_TOKEN + INSTAGRAM_BUSINESS_ID (Meta developer-app
review is outside this repo's control — see README/deliverables notes). It's
a documented no-op until both are set, and every failure mode below is
caught and logged rather than raised, so a bad sync never touches the
public `/instagram/latest` endpoint — that endpoint just keeps serving
whatever was cached from the last successful run.

Intended to run on a schedule via POST /api/v1/sync/instagram (see
app/api/v1/sync.py), behind a shared-secret header. Wiring an actual
scheduler (Render cron, GitHub Actions, etc.) to call that endpoint
periodically is a deployment concern, not this module's.
"""

import logging
from datetime import datetime, timezone

import httpx

from app.core.config import get_settings
from app.repositories import instagram_repository

logger = logging.getLogger("elato.instagram_sync")

_GRAPH_URL_TMPL = "https://graph.facebook.com/v21.0/{business_id}/media"
_FIELDS = "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp"
_CAP = 12


async def sync_instagram_posts() -> int:
    settings = get_settings()
    if not settings.instagram_graph_token or not settings.instagram_business_id:
        logger.info("Instagram sync skipped — INSTAGRAM_GRAPH_TOKEN/INSTAGRAM_BUSINESS_ID not configured.")
        return 0

    url = _GRAPH_URL_TMPL.format(business_id=settings.instagram_business_id)
    try:
        async with httpx.AsyncClient(timeout=10) as http:
            resp = await http.get(
                url,
                params={
                    "fields": _FIELDS,
                    "limit": _CAP,
                    "access_token": settings.instagram_graph_token,
                },
            )
            resp.raise_for_status()
            payload = resp.json()
    except (httpx.HTTPError, ValueError) as exc:
        # Fail safely: log and leave the existing cache untouched so the
        # website keeps serving the last known-good reels.
        logger.error(f"Instagram Graph API sync request failed: {exc}")
        return 0

    media = payload.get("data", [])
    # Only Reels — the homepage carousel this feeds is reels-specific, and
    # "only the required fields" means we don't cache feed photos/carousels.
    reels = [m for m in media if m.get("media_product_type") == "REELS" and m.get("id") and m.get("media_url")]

    synced_at = datetime.now(timezone.utc).isoformat()
    rows = [
        {
            "instagram_media_id": m["id"],
            "media_type": m.get("media_type"),
            "is_reel": True,
            "caption": m.get("caption"),
            "thumbnail_url": m.get("thumbnail_url") or m["media_url"],
            "media_url": m["media_url"],
            "permalink": m.get("permalink"),
            "posted_at": m.get("timestamp"),
            "updated_at": synced_at,
        }
        for m in reels
    ]

    try:
        instagram_repository.upsert_many(rows)
        instagram_repository.prune_missing([row["instagram_media_id"] for row in rows])
    except Exception as exc:
        # A Supabase hiccup mid-sync must not take the endpoint down or
        # leave the cache half-written from the caller's point of view.
        logger.error(f"Instagram sync failed to write to Supabase: {exc}")
        return 0

    logger.info(f"Instagram sync complete — {len(rows)} reel(s) cached.")
    return len(rows)
