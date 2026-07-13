"""
ELATŌ Backend — FastAPI entrypoint.

This is a scaffold only. No business endpoints are implemented yet —
see app/api/v1/ for where versioned routes will be registered once
Sprint 2 (Database + API) begins.
"""

from fastapi import FastAPI

app = FastAPI(title="ELATŌ API", version="0.0.0")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
