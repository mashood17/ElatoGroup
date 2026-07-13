from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentAdmin, get_current_admin, require_role
from app.repositories import event_package_repository
from app.schemas.common import Page, PaginationParams
from app.schemas.event_package import EventPackageCreate, EventPackageOut, EventPackageUpdate

router = APIRouter(prefix="/admin/event-packages", tags=["admin-event-packages"])


@router.get("", response_model=Page[EventPackageOut])
def list_event_packages(pagination: PaginationParams = Depends(), admin: CurrentAdmin = Depends(get_current_admin)):
    items, total = event_package_repository.list_admin(pagination.limit, pagination.offset)
    return Page(items=items, total=total, limit=pagination.limit, offset=pagination.offset)


@router.get("/{package_id}", response_model=EventPackageOut)
def get_event_package(package_id: str, admin: CurrentAdmin = Depends(get_current_admin)):
    return event_package_repository.get(package_id)


@router.post("", response_model=EventPackageOut, status_code=201)
def create_event_package(
    payload: EventPackageCreate, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))
):
    return event_package_repository.create(payload.model_dump())


@router.patch("/{package_id}", response_model=EventPackageOut)
def update_event_package(
    package_id: str,
    payload: EventPackageUpdate,
    admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor")),
):
    return event_package_repository.update(package_id, payload.model_dump(exclude_none=True))


@router.delete("/{package_id}", status_code=204)
def delete_event_package(package_id: str, admin: CurrentAdmin = Depends(require_role("owner", "admin"))):
    event_package_repository.delete(package_id)
