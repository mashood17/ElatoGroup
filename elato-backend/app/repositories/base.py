"""Small shared helpers for repositories built on the Supabase Python client."""

from typing import Any

from postgrest.exceptions import APIError

from app.core.exceptions import AppError
from app.db import get_supabase


def client():
    return get_supabase()


def raise_for_postgrest(exc: APIError) -> None:
    """Repositories catch APIError and call this so a bad DB response
    becomes the app's standard error shape instead of a raw 500 traceback."""
    raise AppError(code="database_error", message=str(exc.message or exc), status_code=502) from exc


def unwrap_single(rows: list[dict[str, Any]], not_found_message: str) -> dict[str, Any]:
    if not rows:
        from app.core.exceptions import NotFoundError

        raise NotFoundError(not_found_message)
    return rows[0]
