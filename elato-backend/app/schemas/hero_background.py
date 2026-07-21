from pydantic import BaseModel


class HeroBackgroundOut(BaseModel):
    slot: str
    video_url: str
    video_mime: str
    poster_url: str | None = None
    width: int | None = None
    height: int | None = None
    duration_seconds: float | None = None
    file_size_bytes: int
    updated_at: str
