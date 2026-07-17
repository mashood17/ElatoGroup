from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    author_name: str | None = Field(default=None, max_length=200)
    rating: int | None = Field(default=None, ge=1, le=5)
    text: str | None = None
    is_featured: bool = False
    source: str = "manual"


class ReviewUpdate(BaseModel):
    author_name: str | None = Field(default=None, max_length=200)
    rating: int | None = Field(default=None, ge=1, le=5)
    text: str | None = None
    is_featured: bool | None = None


class ReviewOut(BaseModel):
    id: str
    source: str
    author_name: str | None = None
    rating: int | None = None
    text: str | None = None
    is_featured: bool
    fetched_at: str


class ReviewAggregateOut(BaseModel):
    rating: float
    count: int
