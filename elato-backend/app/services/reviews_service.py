"""
Google Places review sync. Requires GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID
(Section 9 of the product brief flags these as pending client-side
registration) — until both are set this is a documented no-op rather than a
failure, so the rest of the API keeps working with whatever reviews already
exist in the `reviews` table.
"""

import httpx

from app.core.config import get_settings
from app.repositories import review_repository

_PLACES_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"


async def sync_google_reviews() -> int:
    settings = get_settings()
    if not settings.google_places_api_key or not settings.google_place_id:
        return 0

    async with httpx.AsyncClient(timeout=10) as http:
        resp = await http.get(
            _PLACES_DETAILS_URL,
            params={
                "place_id": settings.google_place_id,
                "fields": "reviews",
                "key": settings.google_places_api_key,
            },
        )
        resp.raise_for_status()
        payload = resp.json()

    reviews = payload.get("result", {}).get("reviews", [])
    rows = [
        {
            "source": "google",
            "author_name": r.get("author_name"),
            "rating": r.get("rating"),
            "text": r.get("text"),
            "is_featured": False,
        }
        for r in reviews
    ]
    review_repository.upsert_from_source(rows)
    return len(rows)
