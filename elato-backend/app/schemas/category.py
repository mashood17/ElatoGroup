from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    slug: str = Field(min_length=1, max_length=140, pattern="^[a-z0-9-]+$")
    description: str | None = None
    display_order: int = 0
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    slug: str | None = Field(default=None, min_length=1, max_length=140, pattern="^[a-z0-9-]+$")
    description: str | None = None
    display_order: int | None = None
    is_active: bool | None = None


class CategoryOut(CategoryBase):
    id: str
    created_at: str
