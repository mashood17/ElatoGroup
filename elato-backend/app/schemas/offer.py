from datetime import date

from pydantic import BaseModel, Field


class OfferBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str | None = None
    reward_text: str = Field(min_length=1, max_length=60)
    scratch_reveal_text: str | None = Field(default=None, max_length=120)
    popup_heading: str = Field(default="An Exclusive Gift Awaits", max_length=120)
    button_text: str = Field(default="Avail Offer", max_length=40)
    valid_from: date | None = None
    valid_to: date | None = None


class OfferCreate(OfferBase):
    is_active: bool = False


class OfferUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = None
    reward_text: str | None = Field(default=None, min_length=1, max_length=60)
    scratch_reveal_text: str | None = Field(default=None, max_length=120)
    popup_heading: str | None = Field(default=None, max_length=120)
    button_text: str | None = Field(default=None, max_length=40)
    valid_from: date | None = None
    valid_to: date | None = None
    is_active: bool | None = None


class OfferOut(OfferBase):
    id: str
    is_active: bool
    created_at: str
    updated_at: str


class ActiveOfferOut(BaseModel):
    """Public shape for GET /offers/active — no admin-only bookkeeping
    fields (is_active, validity window, timestamps aren't the scratch
    card's business)."""

    id: str
    reward_text: str
    scratch_reveal_text: str | None = None
    popup_heading: str
    button_text: str
    description: str | None = None
