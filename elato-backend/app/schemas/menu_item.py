from pydantic import BaseModel, Field


class MenuItemBase(BaseModel):
    category_id: str
    name: str = Field(min_length=1, max_length=160)
    description: str | None = None
    price: float | None = Field(default=None, ge=0)
    image_id: str | None = None
    is_available: bool = True
    is_veg: bool = True
    delivery_available: bool = True
    display_order: int = 0


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemUpdate(BaseModel):
    category_id: str | None = None
    name: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = None
    price: float | None = Field(default=None, ge=0)
    image_id: str | None = None
    is_available: bool | None = None
    is_veg: bool | None = None
    delivery_available: bool | None = None
    display_order: int | None = None


class MenuItemOut(MenuItemBase):
    id: str
    created_at: str
    # Resolved public URL for `image_id`, filled in by the public endpoint from
    # the embedded media row. `image_id` is preserved for admin/back-compat.
    image_url: str | None = None
