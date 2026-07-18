"""
Instagram Graph API sync — pulls the latest Reels from the configured
Instagram Business Account, downloads each new reel's video and thumbnail
and re-hosts them in Supabase Storage (Instagram's own CDN URLs are signed
and expire, so hot-linking media_url directly would eventually break the
public site), and upserts the result into the `instagram_posts` cache keyed
on `instagram_media_id` — re-running never re-downloads media it already
has a hosted copy of, and never duplicates a row. `prune_missing` only ever
removes previously-synced rows, so the handful of legacy manually-created
rows in this table are never touched by a sync run.

Requires INSTAGRAM_GRAPH_TOKEN + INSTAGRAM_BUSINESS_ID (Meta developer-app
review is outside this repo's control — see elato-backend/.env.example).
It's a documented no-op until both are set, and every failure mode below is
caught and logged rather than raised, so a bad sync never touches the
public `/instagram/latest` endpoint — that endpoint just keeps serving
whatever was cached from the last successful run. Every run — success,
partial failure, or skipped for missing config — updates
`instagram_sync_status` so the admin "Instagram Integration" panel always
reflects the real state instead of going silently stale.

Triggered by POST /api/v1/sync/instagram (cron, see app/api/v1/sync.py) and
POST /admin/instagram/sync ("Sync Now" in the admin panel).
"""

import logging
from datetime import datetime, timezone

import httpx

from app.core.config import get_settings
from app.db import get_supabase
from app.repositories import instagram_repository

logger = logging.getLogger("elato.instagram_sync")

_GRAPH_VERSION = "v21.0"
_MEDIA_URL_TMPL = f"https://graph.facebook.com/{_GRAPH_VERSION}/{{business_id}}/media"
_ACCOUNT_URL_TMPL = f"https://graph.facebook.com/{_GRAPH_VERSION}/{{business_id}}"
_MEDIA_FIELDS = "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp"
_CAP = 12
_STORAGE_BUCKET = "public-assets"
# Metadata calls are fast; video downloads need more room than the default.
_TIMEOUT = httpx.Timeout(60.0, connect=15.0)


async def _fetch_account_username(http: httpx.AsyncClient, business_id: str, token: str) -> str | None:
    try:
        resp = await http.get(
            _ACCOUNT_URL_TMPL.format(business_id=business_id),
            params={"fields": "username", "access_token": token},
        )
        resp.raise_for_status()
        return resp.json().get("username")
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning(f"Could not fetch Instagram account username: {exc}")
        return None


async def _download(http: httpx.AsyncClient, url: str) -> bytes | None:
    try:
        resp = await http.get(url)
        resp.raise_for_status()
        return resp.content
    except httpx.HTTPError as exc:
        logger.warning(f"Failed to download Instagram media from {url}: {exc}")
        return None


def _upload(media_id: str, filename: str, content: bytes, content_type: str) -> str:
    supabase = get_supabase()
    path = f"instagram-reels/{media_id}/{filename}"
    supabase.storage.from_(_STORAGE_BUCKET).upload(
        path, content, {"content-type": content_type, "cache-control": "31536000", "upsert": "true"}
    )
    return supabase.storage.from_(_STORAGE_BUCKET).get_public_url(path)


async def _persist_media(
    http: httpx.AsyncClient, media_id: str, video_url: str, thumb_url: str | None
) -> tuple[str | None, str | None]:
    """Downloads a reel's video (and thumbnail, if Instagram provided one)
    and re-hosts them in Supabase Storage. Returns (hosted_video_url,
    hosted_thumbnail_url) — either may be None if its download/upload
    failed, in which case the caller falls back to Instagram's own
    (temporary) CDN URL rather than dropping the reel entirely."""
    hosted_video = None
    video_bytes = await _download(http, video_url)
    if video_bytes:
        try:
            hosted_video = _upload(media_id, "video.mp4", video_bytes, "video/mp4")
        except Exception as exc:
            logger.warning(f"Failed to store video for {media_id}: {exc}")

    hosted_thumb = None
    if thumb_url:
        thumb_bytes = await _download(http, thumb_url)
        if thumb_bytes:
            try:
                hosted_thumb = _upload(media_id, "thumb.jpg", thumb_bytes, "image/jpeg")
            except Exception as exc:
                logger.warning(f"Failed to store thumbnail for {media_id}: {exc}")

    return hosted_video, hosted_thumb


async def sync_instagram_posts() -> int:
    settings = get_settings()
    token = settings.instagram_graph_token
    business_id = settings.instagram_business_id
    auto_sync_enabled = bool(token and business_id)

    if not auto_sync_enabled:
        logger.info("Instagram sync skipped — INSTAGRAM_GRAPH_TOKEN/INSTAGRAM_BUSINESS_ID not configured.")
        instagram_repository.upsert_sync_status(
            {
                "last_sync_status": "not_configured",
                "last_sync_error": None,
                "imported_reels_count": instagram_repository.count_reels(),
                "auto_sync_enabled": False,
            }
        )
        return 0

    async with httpx.AsyncClient(timeout=_TIMEOUT) as http:
        try:
            resp = await http.get(
                _MEDIA_URL_TMPL.format(business_id=business_id),
                params={"fields": _MEDIA_FIELDS, "limit": _CAP, "access_token": token},
            )
            resp.raise_for_status()
            payload = resp.json()
        except (httpx.HTTPError, ValueError) as exc:
            # Fail safely: log and leave the existing cache untouched so the
            # website keeps serving the last known-good reels.
            logger.error(f"Instagram Graph API sync request failed: {exc}")
            instagram_repository.upsert_sync_status(
                {
                    "last_sync_status": "error",
                    "last_sync_error": str(exc),
                    "imported_reels_count": instagram_repository.count_reels(),
                    "auto_sync_enabled": True,
                }
            )
            return 0

        username = await _fetch_account_username(http, business_id, token)

        media = payload.get("data", [])
        # Only Reels — the homepage carousel this feeds is reels-specific,
        # and "only the required fields" means we don't cache feed photos.
        reels = [m for m in media if m.get("media_product_type") == "REELS" and m.get("id") and m.get("media_url")]

        media_ids = [m["id"] for m in reels]
        already_synced = instagram_repository.list_synced_media(media_ids)

        synced_at = datetime.now(timezone.utc).isoformat()
        rows = []
        for m in reels:
            media_id = m["id"]
            existing = already_synced.get(media_id)

            if existing and existing.get("video_url"):
                # Already downloaded on a previous run — avoid a duplicate
                # download/upload, just refresh metadata Instagram might
                # have changed (caption edits) and bump synced_at.
                video_url = existing["video_url"]
                thumbnail_url = existing.get("thumbnail_url") or existing.get("media_url")
                display_url = existing.get("media_url") or thumbnail_url
            else:
                hosted_video, hosted_thumb = await _persist_media(http, media_id, m["media_url"], m.get("thumbnail_url"))
                video_url = hosted_video or m["media_url"]
                thumbnail_url = hosted_thumb or m.get("thumbnail_url") or m["media_url"]
                display_url = thumbnail_url

            rows.append(
                {
                    "instagram_media_id": media_id,
                    "media_type": m.get("media_type"),
                    "is_reel": True,
                    "caption": m.get("caption"),
                    "thumbnail_url": thumbnail_url,
                    "media_url": display_url,
                    "video_url": video_url,
                    "permalink": m.get("permalink"),
                    "posted_at": m.get("timestamp"),
                    "import_status": "synced",
                    "synced_at": synced_at,
                    "updated_at": synced_at,
                }
            )

        try:
            instagram_repository.upsert_many(rows)
            instagram_repository.prune_missing(media_ids)
        except Exception as exc:
            # A Supabase hiccup mid-sync must not take the endpoint down or
            # leave the cache half-written from the caller's point of view.
            logger.error(f"Instagram sync failed to write to Supabase: {exc}")
            instagram_repository.upsert_sync_status(
                {
                    "connected_account_username": username,
                    "last_sync_status": "error",
                    "last_sync_error": str(exc),
                    "imported_reels_count": instagram_repository.count_reels(),
                    "auto_sync_enabled": True,
                }
            )
            return 0

        instagram_repository.upsert_sync_status(
            {
                "connected_account_username": username,
                "last_synced_at": synced_at,
                "last_sync_status": "success",
                "last_sync_error": None,
                "imported_reels_count": instagram_repository.count_reels(),
                "auto_sync_enabled": True,
            }
        )

        logger.info(f"Instagram sync complete — {len(rows)} reel(s) cached.")
        return len(rows)
