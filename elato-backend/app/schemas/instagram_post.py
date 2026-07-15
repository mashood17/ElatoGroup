from pydantic import BaseModel


class InstagramPostOut(BaseModel):
    id: str
    media_type: str | None = None
    is_reel: bool = False
    thumbnail_url: str | None = None
    media_url: str
    permalink: str | None = None
    caption: str | None = None
    posted_at: str | None = None
