"""
Test env setup. `app.core.config.Settings` requires SUPABASE_URL and
SUPABASE_SECRET_KEY (no defaults — see config.py's docstring: the app must
fail fast at boot if they're missing, not on first query). Tests never talk
to a real Supabase project — `app.db.get_supabase()` is only called by
repositories, which none of these smoke tests exercise — so dummy values are
enough to let Settings() validate and the app import successfully.

Set via os.environ (not a .env file) so this works identically in CI and
locally without requiring a checked-in secrets file, and so it can't
accidentally pick up a developer's real local `.env`.
"""

import os

os.environ.setdefault("ENV", "test")
os.environ.setdefault("JWT_SECRET", "test-only-secret-not-for-production")
os.environ.setdefault("SUPABASE_URL", "https://test-project.supabase.co")
os.environ.setdefault("SUPABASE_SECRET_KEY", "test-only-service-role-key")
os.environ.setdefault("SYNC_CRON_SECRET", "test-only-cron-secret")
os.environ.setdefault("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174")
