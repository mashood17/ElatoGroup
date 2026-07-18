from pydantic import BaseModel


class InstagramPostOut(BaseModel):
    id: str
    media_type: str | None = None
    is_reel: bool = False
    thumbnail_url: str | None = None
    media_url: str
    video_url: str | None = None
    permalink: str | None = None
    caption: str | None = None
    posted_at: str | None = None
    import_status: str = "manual"
    synced_at: str | None = None


class InstagramSyncStatusOut(BaseModel):
    """Backs the admin 'Instagram Integration' panel — connection state,
    which account is linked, when it last synced, and how many reels are
    live, refreshed after every sync run (cron or manual 'Sync Now')."""

    connected: bool
    account_username: str | None = None
    last_synced_at: str | None = None
    last_sync_status: str | None = None
    last_sync_error: str | None = None
    imported_reels_count: int = 0
    auto_sync_enabled: bool = False
