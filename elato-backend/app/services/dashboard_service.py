from app.repositories import (
    analytics_repository,
    category_repository,
    instagram_repository,
    menu_item_repository,
    review_repository,
)
from app.schemas.dashboard import DashboardStats


def get_stats() -> DashboardStats:
    return DashboardStats(
        total_categories=category_repository.count_all(),
        total_menu_items=menu_item_repository.count_all(),
        total_instagram_reels=instagram_repository.count_reels(),
        total_reviews=review_repository.count_all(),
        analytics_last_30_days=analytics_repository.counts_by_event_last_n_days(30),
        recent_events=analytics_repository.recent_grouped_by_name(8),
    )
