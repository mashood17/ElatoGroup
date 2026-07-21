from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentAdmin, get_current_admin, require_role
from app.repositories import offer_repository
from app.schemas.offer import OfferCreate, OfferOut, OfferUpdate
from app.services import offer_service

router = APIRouter(prefix="/admin/offers", tags=["admin-offers"])


@router.get("", response_model=list[OfferOut])
def list_offers(admin: CurrentAdmin = Depends(get_current_admin)):
    return offer_repository.list_all()


@router.post("", response_model=OfferOut, status_code=201)
def create_offer(payload: OfferCreate, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))):
    fields = payload.model_dump(mode="json")
    return offer_service.create_offer(fields)


@router.patch("/{offer_id}", response_model=OfferOut)
def update_offer(
    offer_id: str, payload: OfferUpdate, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))
):
    fields = payload.model_dump(mode="json", exclude_unset=True)
    return offer_service.update_offer(offer_id, fields)


@router.delete("/{offer_id}", status_code=204)
def delete_offer(offer_id: str, admin: CurrentAdmin = Depends(require_role("owner", "admin"))):
    offer_service.delete_offer(offer_id)


@router.post("/{offer_id}/activate", response_model=OfferOut)
def activate_offer(offer_id: str, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))):
    return offer_service.activate_offer(offer_id)


@router.post("/{offer_id}/deactivate", response_model=OfferOut)
def deactivate_offer(offer_id: str, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))):
    return offer_service.deactivate_offer(offer_id)
