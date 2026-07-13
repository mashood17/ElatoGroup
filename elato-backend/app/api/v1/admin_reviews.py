from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentAdmin, get_current_admin, require_role
from app.repositories import review_repository
from app.schemas.common import Page, PaginationParams
from app.schemas.review import ReviewOut, ReviewUpdate

router = APIRouter(prefix="/admin/reviews", tags=["admin-reviews"])


@router.get("", response_model=Page[ReviewOut])
def list_reviews(pagination: PaginationParams = Depends(), admin: CurrentAdmin = Depends(get_current_admin)):
    items, total = review_repository.list_admin(pagination.limit, pagination.offset)
    return Page(items=items, total=total, limit=pagination.limit, offset=pagination.offset)


@router.patch("/{review_id}", response_model=ReviewOut)
def curate_review(
    review_id: str, payload: ReviewUpdate, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))
):
    return review_repository.update(review_id, payload.model_dump(exclude_none=True))
