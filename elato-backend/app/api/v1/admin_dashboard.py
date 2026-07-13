from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentAdmin, get_current_admin
from app.schemas.dashboard import DashboardStats
from app.services import dashboard_service

router = APIRouter(prefix="/admin/dashboard", tags=["admin-dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(admin: CurrentAdmin = Depends(get_current_admin)):
    return dashboard_service.get_stats()
