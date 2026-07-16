"""
Every endpoint here is unauthenticated and reads through repositories that
only ever select active/public rows — mirrors the RLS policies in migration
0001 so the backend and the database agree on what "public" means.
"""

from fastapi import APIRouter, Query, Request, Response

from app.repositories import (
    category_repository,
    enquiry_repository,
    event_package_repository,
    gallery_repository,
    instagram_repository,
    menu_item_repository,
    review_repository,
    room_repository,
    site_content_repository,
    special_repository,
)
from app.repositories import analytics_repository
from app.schemas.analytics_event import AnalyticsEventCreate
from app.schemas.category import CategoryOut
from app.schemas.enquiry import EnquiryCreate, EnquiryOut
from app.schemas.event_package import EventPackageOut
from app.schemas.gallery import GalleryItemOut
from app.schemas.instagram_post import InstagramPostOut
from app.schemas.menu_item import MenuItemOut
from app.schemas.review import ReviewAggregateOut, ReviewOut
from app.schemas.room import RoomOut
from app.schemas.site_content import SiteContentOut
from app.schemas.special import SpecialOut

router = APIRouter(prefix="", tags=["public"])


@router.get("/site-content/{key}", response_model=SiteContentOut)
def get_site_content(key: str):
    return SiteContentOut(**site_content_repository.get(key))


@router.get("/categories", response_model=list[CategoryOut])
def list_categories():
    return category_repository.list_public()


@router.get("/menu-items", response_model=list[MenuItemOut])
def list_menu_items(category_id: str | None = None, is_available: bool | None = None):
    return menu_item_repository.list_public(category_id, is_available)


@router.get("/specials", response_model=list[SpecialOut])
def list_specials():
    return special_repository.list_public()


@router.get("/gallery", response_model=list[GalleryItemOut])
def list_gallery(category: str | None = None):
    from app.db import get_supabase

    rows = gallery_repository.list_public(category)
    out = []
    for row in rows:
        media = row.pop("media", None) or {}
        storage_path = media.get("storage_path")
        bucket = media.get("bucket")
        media_url = get_supabase().storage.from_(bucket).get_public_url(storage_path) if storage_path and bucket else None
        out.append(GalleryItemOut(**row, media_url=media_url))
    return out


@router.get("/event-packages", response_model=list[EventPackageOut])
def list_event_packages():
    return event_package_repository.list_public()


@router.get("/rooms", response_model=list[RoomOut])
def list_rooms():
    return room_repository.list_public()


@router.get("/reviews/featured", response_model=list[ReviewOut])
def list_featured_reviews():
    return review_repository.list_featured()


@router.get("/reviews/aggregate", response_model=ReviewAggregateOut)
def get_reviews_aggregate(response: Response):
    # Business-wide rating/count changes rarely — safe to cache briefly
    # rather than hit Supabase on every homepage load.
    response.headers["Cache-Control"] = "public, max-age=300"
    return review_repository.get_aggregate()


@router.get("/instagram/latest", response_model=list[InstagramPostOut])
def list_latest_instagram(response: Response):
    # instagram_posts is a synced cache (see instagram_service), not a live
    # Instagram call — safe to let browsers/CDN cache the response briefly
    # rather than hit Supabase on every homepage load.
    response.headers["Cache-Control"] = "public, max-age=300"
    return instagram_repository.list_latest(cap=8)


@router.post("/enquiries", response_model=EnquiryOut, status_code=201)
def create_enquiry(payload: EnquiryCreate):
    fields = payload.model_dump(mode="json", exclude_none=False)
    row = enquiry_repository.create(fields)
    if row.get("preferred_date"):
        row["preferred_date"] = str(row["preferred_date"])
    return EnquiryOut(**row)


@router.post("/analytics/events", status_code=204)
def create_analytics_event(payload: AnalyticsEventCreate, request: Request):
    # Fire-and-forget from the frontend's point of view: we still validate
    # and persist, but never return anything that could make a caller think
    # a failure here should block the UI.
    analytics_repository.create(payload.model_dump())
