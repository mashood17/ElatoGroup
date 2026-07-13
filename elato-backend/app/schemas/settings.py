from typing import Any

from pydantic import BaseModel


class SettingOut(BaseModel):
    key: str
    value: Any
    updated_at: str


class SettingUpsert(BaseModel):
    value: Any
