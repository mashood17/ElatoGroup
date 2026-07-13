from typing import Any

from pydantic import BaseModel


class SiteContentOut(BaseModel):
    key: str
    value: Any
    updated_at: str


class SiteContentUpsert(BaseModel):
    value: Any
