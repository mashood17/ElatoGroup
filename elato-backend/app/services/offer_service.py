from datetime import date
from typing import Any

from app.repositories import offer_repository


def create_offer(fields: dict[str, Any]) -> dict[str, Any]:
    if fields.get("is_active"):
        offer_repository.deactivate_all()
    return offer_repository.create(fields)


def update_offer(offer_id: str, fields: dict[str, Any]) -> dict[str, Any]:
    if fields.get("is_active"):
        offer_repository.deactivate_all()
    return offer_repository.update(offer_id, fields)


def delete_offer(offer_id: str) -> None:
    offer_repository.delete(offer_id)


def activate_offer(offer_id: str) -> dict[str, Any]:
    offer_repository.get(offer_id)  # raises NotFoundError if missing
    return offer_repository.set_active(offer_id)


def deactivate_offer(offer_id: str) -> dict[str, Any]:
    offer_repository.get(offer_id)
    return offer_repository.update(offer_id, {"is_active": False})


def get_active_offer() -> dict[str, Any] | None:
    """The single source of truth for "what offer does the scratch card show
    right now" — active flag AND validity window, so an admin doesn't have to
    remember to flip is_active off when an offer's valid_to date passes."""
    offer = offer_repository.get_active()
    if not offer:
        return None

    today = date.today()
    valid_from = offer.get("valid_from")
    valid_to = offer.get("valid_to")
    if valid_from and date.fromisoformat(valid_from) > today:
        return None
    if valid_to and date.fromisoformat(valid_to) < today:
        return None
    return offer
