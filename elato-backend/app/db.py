"""
Supabase client factory. Repositories are the only code allowed to import
from here — every Supabase query in the app goes through this client.

Uses the service-role key exclusively (server-side only), which bypasses RLS
by design: RLS protects the anon/public surface, not the backend itself. The
backend is the trusted boundary that enforces authorization via
get_current_admin / require_role instead.
"""

from functools import lru_cache

from supabase import Client, create_client

from app.core.config import get_settings


@lru_cache
def get_supabase() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_secret_key)
