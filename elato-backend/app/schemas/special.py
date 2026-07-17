from datetime import date

from pydantic import BaseModel, Field


class SpecialBase(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    description: str | None = None
    price: float | None = Field(default=None, ge=0)
    image_id: str | None = None
    menu_item_id: str | None = None
    active_from: date | None = None
    active_to: date | None = None
    is_active: bool = True
    display_order: int = 0


class SpecialCreate(SpecialBase):
    pass


class SpecialUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = None
    price: float | None = Field(default=None, ge=0)
    image_id: str | None = None
    menu_item_id: str | None = None
    active_from: date | None = None
    active_to: date | None = None
    is_active: bool | None = None
    display_order: int | None = None


class SpecialOut(SpecialBase):
    id: str
    created_at: str
    # Resolved public URL for `image_id`, filled in by the public endpoint from
    # the embedded media row. `image_id` is preserved for admin/back-compat.
    image_url: str | None = None
