from pydantic import BaseModel, Field


class RoomBase(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    description: str | None = None
    capacity: int | None = Field(default=None, ge=0)
    amenities: list[str] = Field(default_factory=list)
    image_ids: list[str] = Field(default_factory=list)
    is_active: bool = True


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = None
    capacity: int | None = Field(default=None, ge=0)
    amenities: list[str] | None = None
    image_ids: list[str] | None = None
    is_active: bool | None = None


class RoomOut(RoomBase):
    id: str
