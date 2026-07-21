from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentAdmin, get_current_admin, require_role
from app.repositories import offer_registration_repository
from app.schemas.common import Page, PaginationParams
from app.schemas.offer_registration import OfferRegistrationOut, OfferRegistrationRedeem
from app.services import offer_registration_service

router = APIRouter(prefix="/admin/offer-registrations", tags=["admin-offer-registrations"])


@router.get("", response_model=Page[OfferRegistrationOut])
def search_registrations(
    q: str | None = None,
    offer_id: str | None = None,
    country_code: str | None = None,
    status: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    pagination: PaginationParams = Depends(),
    admin: CurrentAdmin = Depends(get_current_admin),
):
    rows, total = offer_registration_repository.search(
        pagination.limit, pagination.offset, q, offer_id, country_code, status, date_from, date_to
    )
    return Page(items=rows, total=total, limit=pagination.limit, offset=pagination.offset)


@router.post("/{registration_id}/redeem", response_model=OfferRegistrationOut)
def redeem_registration(
    registration_id: str,
    payload: OfferRegistrationRedeem,
    admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor")),
):
    return offer_registration_service.mark_redeemed(registration_id, admin.id, payload.notes)
