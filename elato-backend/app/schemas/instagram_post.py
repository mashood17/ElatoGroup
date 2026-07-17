from pydantic import BaseModel, Field


class InstagramPostCreate(BaseModel):
    """Manual entry: an admin pastes the Reel URL and uploads a cover image
    themselves — nothing here is auto-fetched from Instagram."""

    permalink: str = Field(min_length=1, max_length=500)
    media_id: str
    caption: str | None = None


class InstagramPostUpdate(BaseModel):
    permalink: str | None = Field(default=None, min_length=1, max_length=500)
    media_id: str | None = None
    caption: str | None = None


class InstagramPostOut(BaseModel):
    id: str
    media_type: str | None = None
    is_reel: bool = False
    thumbnail_url: str | None = None
    media_url: str
    permalink: str | None = None
    caption: str | None = None
    posted_at: str | None = None
