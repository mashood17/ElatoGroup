from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentAdmin, get_current_admin
from app.schemas.auth import (
    AccessTokenResponse,
    AdminOut,
    LoginRequest,
    LogoutRequest,
    PasswordResetConfirmSchema,
    PasswordResetRequestSchema,
    RefreshRequest,
    TokenPairResponse,
)
from app.services import auth_service

router = APIRouter(prefix="/admin/auth", tags=["admin-auth"])


@router.post("/login", response_model=TokenPairResponse)
def login(payload: LoginRequest):
    admin, access, refresh = auth_service.login(payload.email, payload.password)
    return TokenPairResponse(access_token=access, refresh_token=refresh, admin=AdminOut(**admin))


@router.post("/refresh", response_model=AccessTokenResponse)
def refresh(payload: RefreshRequest):
    access, refresh_token = auth_service.refresh(payload.refresh_token)
    return AccessTokenResponse(access_token=access, refresh_token=refresh_token)


@router.post("/logout", status_code=204)
def logout(payload: LogoutRequest, admin: CurrentAdmin = Depends(get_current_admin)):
    auth_service.logout(payload.refresh_token, admin.id, payload.everywhere)


@router.post("/password-reset-request", status_code=204)
def password_reset_request(payload: PasswordResetRequestSchema):
    auth_service.request_password_reset(payload.email)


@router.post("/password-reset-confirm", status_code=204)
def password_reset_confirm(payload: PasswordResetConfirmSchema):
    auth_service.confirm_password_reset(payload.token, payload.new_password)
