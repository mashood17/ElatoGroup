"""
Typed, validated app settings. The app fails fast and loudly at startup if a
value marked as required (no default) is missing — never at first request.

SUPABASE_URL / SUPABASE_SECRET_KEY are now required: repositories (Phase 5)
query them on every request, so a misconfigured deploy should fail at boot,
not on the first real query.
"""

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Anchored to this file's location (elato-backend/app/core/config.py -> elato-backend/.env)
# rather than left relative to the process's CWD — CWD varies across how the
# app gets launched (uvicorn --app-dir, a process manager, etc.) and a silent
# "wrong .env" is worse than an explicit path.
_ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=_ENV_FILE, extra="ignore")

    env: str = Field(default="development", alias="ENV")
    port: int = Field(default=8000, alias="PORT")

    # Required once Phase 4 auth is wired in — generate fresh, never reuse Supabase's own secret.
    jwt_secret: str = Field(default="dev-only-insecure-secret-change-me", alias="JWT_SECRET")
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 7

    supabase_url: str = Field(alias="SUPABASE_URL")
    supabase_secret_key: str = Field(alias="SUPABASE_SECRET_KEY")

    whatsapp_business_number: str = Field(default="+919731400313", alias="WHATSAPP_BUSINESS_NUMBER")

    # Password reset emails — Supabase Auth's built-in email sender (see
    # app/services/auth_service.py for the reasoning behind this choice).
    frontend_admin_url: str = Field(
        default="http://localhost:5174", alias="FRONTEND_ADMIN_URL"
    )

    google_places_api_key: str | None = Field(default=None, alias="GOOGLE_PLACES_API_KEY")
    google_place_id: str | None = Field(default=None, alias="GOOGLE_PLACE_ID")
    instagram_graph_token: str | None = Field(default=None, alias="INSTAGRAM_GRAPH_TOKEN")
    instagram_business_id: str | None = Field(default=None, alias="INSTAGRAM_BUSINESS_ID")
    sync_cron_secret: str = Field(default="dev-only-cron-secret-change-me", alias="SYNC_CRON_SECRET")

    cors_allowed_origins: str = Field(
        default="http://localhost:5173,http://localhost:5174",
        alias="CORS_ALLOWED_ORIGINS",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_allowed_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.env == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
