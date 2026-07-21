from typing import Any

from app.core.exceptions import AppError
from app.repositories import offer_registration_repository
from app.services import offer_service


def register_for_active_offer(
    name: str,
    country_code: str,
    phone_number: str,
    consent: bool,
    source: str | None,
    visitor_id: str | None,
) -> dict[str, Any]:
    offer = offer_service.get_active_offer()
    if not offer:
        raise AppError(
            code="no_active_offer",
            message="There is no active offer to register for right now.",
            status_code=404,
        )

    if offer_registration_repository.exists_for_offer_and_phone(offer["id"], country_code, phone_number):
        raise AppError(
            code="duplicate_registration",
            message="This phone number has already registered for the current offer.",
            status_code=409,
        )

    return offer_registration_repository.create(
        {
            "offer_id": offer["id"],
            "offer_name": offer["name"],
            "name": name,
            "country_code": country_code,
            "phone_number": phone_number,
            "consent": consent,
            "source": source,
            "visitor_id": visitor_id,
        }
    )


def mark_redeemed(registration_id: str, redeemed_by: str, notes: str | None) -> dict[str, Any]:
    return offer_registration_repository.mark_redeemed(registration_id, redeemed_by, notes)


def has_visitor_claimed_active_offer(visitor_id: str) -> bool:
    """Lets the popup skip straight to the "already claimed" message for a
    returning visitor, before they've re-typed a phone number — the
    duplicate check at registration time is still phone-based (the actual
    guarantee); this is a read-only convenience lookup by the same
    visitor_id every registration already records."""
    offer = offer_service.get_active_offer()
    if not offer:
        return False
    return offer_registration_repository.exists_for_offer_and_visitor(offer["id"], visitor_id)
