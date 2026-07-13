from typing import Any

from pydantic import BaseModel, Field


class AnalyticsEventCreate(BaseModel):
    event_name: str = Field(min_length=1, max_length=80)
    page: str | None = None
    metadata: dict[str, Any] | None = None
