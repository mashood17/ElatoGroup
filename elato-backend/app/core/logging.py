"""Structured (JSON) logging. Never log secrets — request bodies/headers are
logged by shape/keys only where that matters, not by value."""

import logging
import sys
import uuid
from contextvars import ContextVar

_request_id_ctx: ContextVar[str] = ContextVar("request_id", default="-")


class RequestIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = _request_id_ctx.get()
        return True


def new_request_id() -> str:
    rid = uuid.uuid4().hex[:12]
    _request_id_ctx.set(rid)
    return rid


def configure_logging(env: str) -> None:
    # Force UTF-8 on the stream — Windows consoles default to cp1252, which
    # cannot encode "ELATŌ" (or any non-ASCII log message) and silently
    # corrupts/drops the log line otherwise.
    stream = sys.stdout
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8")
    handler = logging.StreamHandler(stream)
    fmt = '{"time":"%(asctime)s","level":"%(levelname)s","request_id":"%(request_id)s","logger":"%(name)s","message":"%(message)s"}'
    handler.setFormatter(logging.Formatter(fmt))
    handler.addFilter(RequestIdFilter())

    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(logging.DEBUG if env != "production" else logging.INFO)


def log_request_timing(logger: logging.Logger, method: str, path: str, status_code: int, duration_ms: float) -> None:
    logger.info(f"{method} {path} -> {status_code} ({duration_ms:.1f}ms)")
