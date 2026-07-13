from pydantic import BaseModel

from app.schemas.enquiry import EnquiryOut


class DashboardStats(BaseModel):
    total_enquiries: int
    new_enquiries: int
    total_menu_items: int
    total_gallery_items: int
    total_reviews: int
    recent_enquiries: list[EnquiryOut]
    analytics_last_30_days: dict[str, int]
