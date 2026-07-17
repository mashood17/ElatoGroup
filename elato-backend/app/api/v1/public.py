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
from app.services import media_service
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


@router.get("/site-content", response_model=list[SiteContentOut])
def list_site_content(response: Response):
    # All admin-managed section content (hero/services/about images, etc.) in
    # one request so the public site can resolve every slot from a single map
    # rather than one call per key. Values are already public — the per-key
    # endpoint below exposes the same data — and change rarely, so a short
    # browser/CDN cache is safe.
    response.headers["Cache-Control"] = "public, max-age=60"
    return [SiteContentOut(**row) for row in site_content_repository.list_all()]


@router.get("/site-content/{key}", response_model=SiteContentOut)
def get_site_content(key: str):
    return SiteContentOut(**site_content_repository.get(key))


@router.get("/categories", response_model=list[CategoryOut])
def list_categories():
    # Each row carries an embedded media(storage_path, bucket) join — resolve it
    # to the optimized public URL so the Celebré frontend gets a usable image.
    out = []
    for row in category_repository.list_public():
        image_url = media_service.pop_embedded_media_url(row)
        out.append(CategoryOut(**row, image_url=image_url))
    return out


@router.get("/menu-items", response_model=list[MenuItemOut])
def list_menu_items(category_id: str | None = None, is_available: bool | None = None):
    out = []
    for row in menu_item_repository.list_public(category_id, is_available):
        image_url = media_service.pop_embedded_media_url(row)
        out.append(MenuItemOut(**row, image_url=image_url))
    return out


@router.get("/specials", response_model=list[SpecialOut])
def list_specials():
    out = []
    for row in special_repository.list_public():
        image_url = media_service.pop_embedded_media_url(row)
        out.append(SpecialOut(**row, image_url=image_url))
    return out


@router.get("/gallery", response_model=list[GalleryItemOut])
def list_gallery(category: str | None = None):
    out = []
    for row in gallery_repository.list_public(category):
        media_url = media_service.pop_embedded_media_url(row)
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
