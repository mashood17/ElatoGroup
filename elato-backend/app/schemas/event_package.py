from pydantic import BaseModel, Field


class EventPackageBase(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    description: str | None = None
    min_guests: int | None = Field(default=None, ge=0)
    max_guests: int | None = Field(default=None, ge=0)
    image_id: str | None = None
    is_active: bool = True
    display_order: int = 0


class EventPackageCreate(EventPackageBase):
    pass


class EventPackageUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = None
    min_guests: int | None = Field(default=None, ge=0)
    max_guests: int | None = Field(default=None, ge=0)
    image_id: str | None = None
    is_active: bool | None = None
    display_order: int | None = None


class EventPackageOut(EventPackageBase):
    id: str
