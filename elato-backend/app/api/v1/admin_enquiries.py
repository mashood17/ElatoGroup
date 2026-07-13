from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentAdmin, get_current_admin, require_role
from app.repositories import enquiry_repository
from app.schemas.common import Page, PaginationParams
from app.schemas.enquiry import EnquiryOut, EnquiryUpdate

router = APIRouter(prefix="/admin/enquiries", tags=["admin-enquiries"])


def _serialize(row: dict) -> dict:
    return {**row, "preferred_date": str(row["preferred_date"]) if row.get("preferred_date") else None}


@router.get("", response_model=Page[EnquiryOut])
def list_enquiries(
    status: str | None = None,
    pagination: PaginationParams = Depends(),
    admin: CurrentAdmin = Depends(get_current_admin),
):
    rows, total = enquiry_repository.list_admin(pagination.limit, pagination.offset, status)
    items = [EnquiryOut(**_serialize(r)) for r in rows]
    return Page(items=items, total=total, limit=pagination.limit, offset=pagination.offset)


@router.patch("/{enquiry_id}", response_model=EnquiryOut)
def update_enquiry_status(
    enquiry_id: str, payload: EnquiryUpdate, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))
):
    row = enquiry_repository.update_status(enquiry_id, payload.status)
    return EnquiryOut(**_serialize(row))
