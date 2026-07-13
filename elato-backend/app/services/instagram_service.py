"""
Instagram Graph API sync. Requires INSTAGRAM_GRAPH_TOKEN + INSTAGRAM_BUSINESS_ID
(needs Meta developer-app review, outside this repo's control — flagged in
the product brief). No-op until both are configured; the public
`/instagram/latest` endpoint just serves whatever is already cached.
"""

import httpx

from app.core.config import get_settings
from app.repositories import instagram_repository

_GRAPH_URL_TMPL = "https://graph.facebook.com/v21.0/{business_id}/media"
_CAP = 8


async def sync_instagram_posts() -> int:
    settings = get_settings()
    if not settings.instagram_graph_token or not settings.instagram_business_id:
        return 0

    url = _GRAPH_URL_TMPL.format(business_id=settings.instagram_business_id)
    async with httpx.AsyncClient(timeout=10) as http:
        resp = await http.get(
            url,
            params={
                "fields": "media_url,permalink,caption,timestamp",
                "limit": _CAP,
                "access_token": settings.instagram_graph_token,
            },
        )
        resp.raise_for_status()
        payload = resp.json()

    posts = payload.get("data", [])[:_CAP]
    rows = [
        {
            "media_url": p["media_url"],
            "permalink": p.get("permalink"),
            "caption": p.get("caption"),
            "posted_at": p.get("timestamp"),
        }
        for p in posts
        if "media_url" in p
    ]
    instagram_repository.replace_all(rows)
    return len(rows)
