"""
Supabase client factory. Repositories are the only code allowed to import
from here — every Supabase query in the app goes through this client.

Uses the service-role key exclusively (server-side only), which bypasses RLS
by design: RLS protects the anon/public surface, not the backend itself. The
backend is the trusted boundary that enforces authorization via
get_current_admin / require_role instead.
"""

from functools import lru_cache

import httpx
from supabase import Client, create_client

from app.core.config import get_settings


@lru_cache
def get_supabase() -> Client:
    settings = get_settings()
    client = create_client(settings.supabase_url, settings.supabase_secret_key)

    # postgrest-py's own default httpx client (postgrest/_sync/client.py)
    # hardcodes `http2=True`. Under concurrent requests — e.g. a single page
    # load firing categories/menu-items/specials at once, or FastAPI running
    # this app's plain `def` repository functions across several threadpool
    # threads simultaneously — that HTTP/2 connection's multiplexed streams
    # get corrupted, observed directly (via a temporary instance with logging
    # enabled) as `httpcore.ReadError` / `httpx.ConnectError`:
    # "[SSL: DECRYPTION_FAILED_OR_BAD_RECORD_MAC] decryption failed or bad
    # record mac". It surfaces to callers as a generic 500 on whichever of
    # the concurrent requests loses the race — reproducible on any concurrent
    # burst, not specific to one table/route, which is why menu categories,
    # menu items, and specials were all seen failing interchangeably.
    # Forcing HTTP/1.1 (one request per connection, no multiplexed frame
    # interleaving left to corrupt) removes this class of bug outright,
    # rather than retrying or catching around it. Rebuilt from the postgrest
    # client's own already-resolved base_url/headers/timeout (not
    # recomputed by hand) so it can never drift from whatever supabase-py
    # itself decides those should be. Deliberately scoped to postgrest only —
    # storage/functions keep their normal client, since this app never fires
    # concurrent bursts of storage calls the way it does public table reads,
    # and media_service.py's real uploads go through storage and need its
    # own (different) base URL, which a single shared client can't provide.
    pg = client.postgrest
    pg.session = httpx.Client(
        base_url=pg.session.base_url,
        headers=pg.session.headers,
        timeout=pg.session.timeout,
        follow_redirects=True,
        http2=False,
    )

    return client
