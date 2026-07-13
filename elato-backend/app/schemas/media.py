from pydantic import BaseModel


class MediaVariant(BaseModel):
    url: str
    width: int
    height: int
    format: str


class MediaOut(BaseModel):
    id: str
    storage_path: str
    alt_text: str | None = None
    width: int | None = None
    height: int | None = None
    bucket: str
    url: str
    created_at: str


class MediaUploadResponse(BaseModel):
    media: MediaOut
    variants: list[MediaVariant]
