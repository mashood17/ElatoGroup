"""
Shared schema pieces. Pagination convention for the whole API (stated once,
applied everywhere): query params `limit` (default 50, max 100) and `offset`
(default 0). Public catalog endpoints (small tables — menu items, gallery,
etc.) return a bare JSON array to match the frontend repository contract
these are replacing. Admin list endpoints, which drive paginated table UIs,
return the `Page[T]` envelope below so the UI has a total count to page against.
"""

from typing import Generic, TypeVar

from fastapi import Query
from pydantic import BaseModel

T = TypeVar("T")


class PaginationParams:
    def __init__(
        self,
        limit: int = Query(default=50, ge=1, le=100),
        offset: int = Query(default=0, ge=0),
    ):
        self.limit = limit
        self.offset = offset


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    limit: int
    offset: int
