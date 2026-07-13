from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentAdmin, get_current_admin, require_role
from app.repositories import room_repository
from app.schemas.common import Page, PaginationParams
from app.schemas.room import RoomCreate, RoomOut, RoomUpdate

router = APIRouter(prefix="/admin/rooms", tags=["admin-rooms"])


@router.get("", response_model=Page[RoomOut])
def list_rooms(pagination: PaginationParams = Depends(), admin: CurrentAdmin = Depends(get_current_admin)):
    items, total = room_repository.list_admin(pagination.limit, pagination.offset)
    return Page(items=items, total=total, limit=pagination.limit, offset=pagination.offset)


@router.get("/{room_id}", response_model=RoomOut)
def get_room(room_id: str, admin: CurrentAdmin = Depends(get_current_admin)):
    return room_repository.get(room_id)


@router.post("", response_model=RoomOut, status_code=201)
def create_room(payload: RoomCreate, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))):
    return room_repository.create(payload.model_dump())


@router.patch("/{room_id}", response_model=RoomOut)
def update_room(
    room_id: str, payload: RoomUpdate, admin: CurrentAdmin = Depends(require_role("owner", "admin", "editor"))
):
    return room_repository.update(room_id, payload.model_dump(exclude_none=True))


@router.delete("/{room_id}", status_code=204)
def delete_room(room_id: str, admin: CurrentAdmin = Depends(require_role("owner", "admin"))):
    room_repository.delete(room_id)
