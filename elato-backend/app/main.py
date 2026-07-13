"""
ELATŌ Backend — FastAPI entrypoint.

Architecture skeleton only (Phase 2): config, structured logging, request
logging middleware, CORS, global error handling, and the JWT/DI auth
pattern are all real and wired in. No business endpoints exist yet — see
app/api/v1/ for where those get registered in Phase 5.
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging
from app.middleware.request_logging import RequestLoggingMiddleware

settings = get_settings()
configure_logging(settings.env)
logger = logging.getLogger("elato.startup")

app = FastAPI(title="ELATŌ API", version="0.0.0")

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)


@app.on_event("startup")
async def validate_production_config() -> None:
    if settings.is_production and settings.jwt_secret == "dev-only-insecure-secret-change-me":
        raise RuntimeError("JWT_SECRET must be set to a real value in production — refusing to start.")
    logger.info(f"ELATŌ API starting in '{settings.env}' mode.")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
