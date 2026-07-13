from pydantic import BaseModel, Field


class GalleryItemBase(BaseModel):
    media_id: str
    category: str | None = None
    caption: str | None = None
    display_order: int = 0


class GalleryItemCreate(GalleryItemBase):
    pass


class GalleryItemUpdate(BaseModel):
    media_id: str | None = None
    category: str | None = None
    caption: str | None = None
    display_order: int | None = None


class GalleryItemOut(GalleryItemBase):
    id: str
    created_at: str
    media_url: str | None = None
