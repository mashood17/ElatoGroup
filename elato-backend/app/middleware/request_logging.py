"""Assigns a request ID and logs method/path/status/timing for every request."""

import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.types import ASGIApp

from app.core.logging import log_request_timing, new_request_id

logger = logging.getLogger("elato.request")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        request_id = new_request_id()
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000
        response.headers["X-Request-ID"] = request_id
        log_request_timing(logger, request.method, request.url.path, response.status_code, duration_ms)
        return response
