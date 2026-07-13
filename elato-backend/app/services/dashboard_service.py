from app.repositories import analytics_repository, enquiry_repository, gallery_repository, menu_item_repository, review_repository
from app.schemas.dashboard import DashboardStats
from app.schemas.enquiry import EnquiryOut


def get_stats() -> DashboardStats:
    recent = [EnquiryOut(**_serialize_enquiry(row)) for row in enquiry_repository.list_recent(5)]
    return DashboardStats(
        total_enquiries=enquiry_repository.count_all(),
        new_enquiries=enquiry_repository.count_new(),
        total_menu_items=menu_item_repository.count_all(),
        total_gallery_items=gallery_repository.count_all(),
        total_reviews=review_repository.count_all(),
        recent_enquiries=recent,
        analytics_last_30_days=analytics_repository.counts_by_event_last_n_days(30),
    )


def _serialize_enquiry(row: dict) -> dict:
    return {
        **row,
        "preferred_date": str(row["preferred_date"]) if row.get("preferred_date") else None,
    }
