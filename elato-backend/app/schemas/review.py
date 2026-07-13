from pydantic import BaseModel, Field


class ReviewUpdate(BaseModel):
    is_featured: bool | None = None


class ReviewOut(BaseModel):
    id: str
    source: str
    author_name: str | None = None
    rating: int | None = None
    text: str | None = None
    is_featured: bool
    fetched_at: str
