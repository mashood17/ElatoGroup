from pydantic import BaseModel


class InstagramPostOut(BaseModel):
    id: str
    media_url: str
    permalink: str | None = None
    caption: str | None = None
    posted_at: str | None = None
    fetched_at: str
