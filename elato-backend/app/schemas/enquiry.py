from datetime import date

from pydantic import BaseModel, Field, field_validator

from app.core.phone import normalize_and_validate_phone

# Mirrors elato-web/src/lib/validation.ts exactly — the server never trusts
# client-side validation alone.
_NAME_RE = r"^[A-Za-z\s-]{2,60}$"
_SOURCE_PAGES = {"home", "stay", "events", "celebre"}


class EnquiryCreate(BaseModel):
    source_page: str
    name: str = Field(min_length=2, max_length=60)
    phone: str
    email: str | None = None
    message: str | None = Field(default=None, max_length=500)
    guests: int | None = Field(default=None, ge=1)
    preferred_date: date | None = None

    @field_validator("source_page")
    @classmethod
    def validate_source_page(cls, v: str) -> str:
        if v not in _SOURCE_PAGES:
            raise ValueError(f"source_page must be one of {sorted(_SOURCE_PAGES)}")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        import re

        if not re.match(_NAME_RE, v.strip()):
            raise ValueError("Enter 2-60 letters, spaces or hyphens only.")
        return v.strip()

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return normalize_and_validate_phone(v)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str | None) -> str | None:
        import re

        if v is None or v == "":
            return None
        if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", v.strip()):
            raise ValueError("Enter a valid email address.")
        return v.strip()


class EnquiryOut(BaseModel):
    id: str
    source_page: str
    name: str
    phone: str
    email: str | None = None
    message: str | None = None
    guests: int | None = None
    preferred_date: str | None = None
    status: str
    created_at: str
