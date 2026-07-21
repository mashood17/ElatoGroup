import re

from pydantic import BaseModel, Field, field_validator, model_validator

from app.core.phone import normalize_and_validate_phone

_NAME_RE = r"^[A-Za-z\s-]{2,60}$"
_COUNTRY_CODE_RE = r"^\+\d{1,4}$"


class OfferRegistrationCreate(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    country_code: str
    phone_number: str
    consent: bool
    source: str | None = None
    visitor_id: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not re.match(_NAME_RE, v.strip()):
            raise ValueError("Enter 2-60 letters, spaces or hyphens only.")
        return v.strip()

    @field_validator("country_code")
    @classmethod
    def validate_country_code(cls, v: str) -> str:
        cleaned = v.strip()
        if not re.match(_COUNTRY_CODE_RE, cleaned):
            raise ValueError("Enter a valid country dial code, e.g. +91.")
        return cleaned

    @field_validator("consent")
    @classmethod
    def validate_consent(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Consent to receive promotional offers and updates is required.")
        return v

    @model_validator(mode="after")
    def validate_phone(self) -> "OfferRegistrationCreate":
        # Reuses the same combined-E.164 validator as enquiries (strict
        # rules for +91/+971, generic shape check otherwise) even though
        # country_code and phone_number are stored as separate columns here.
        combined = normalize_and_validate_phone(f"{self.country_code}{self.phone_number}")
        self.phone_number = combined.removeprefix(self.country_code)
        return self


class OfferRegistrationOut(BaseModel):
    id: str
    offer_id: str | None = None
    offer_name: str
    name: str
    country_code: str
    phone_number: str
    consent: bool
    source: str | None = None
    status: str
    redeemed_at: str | None = None
    redeemed_by: str | None = None
    notes: str | None = None
    created_at: str


class OfferRegistrationRedeem(BaseModel):
    notes: str | None = Field(default=None, max_length=500)
