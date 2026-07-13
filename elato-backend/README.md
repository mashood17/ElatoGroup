# ELATŌ Backend

FastAPI service for the ELATŌ platform. This is currently a **scaffold only** — no business endpoints, database connection, or auth are implemented yet. See the main PRD (`../docs/ELATO_Product_Requirements_Document.docx`) Ch. 31–44 for the full backend/API/database specification this will implement.

## Structure

```
app/
  main.py          FastAPI entrypoint (currently just a /health check)
  api/
    v1/             Versioned route modules go here (PRD Ch. 34: /api/v1/*)
  core/             App configuration, settings, startup/shutdown wiring
  models/           ORM / database models
  schemas/          Pydantic request/response schemas
  services/         Business logic, orchestration
  repositories/      Data-access layer (mirrors the frontend's repository pattern)
  middleware/       Custom middleware (auth guards, rate limiting, logging)
  utils/            Shared helpers
  storage/          File/media storage integration (Supabase Storage buckets)
migrations/         Database migrations (Alembic, once the schema is defined)
```

## Local setup

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Then visit `http://localhost:8000/health`.

## Status

🔴 Not started beyond this scaffold. See the project-wide implementation audit for the full gap list before beginning Sprint 2.
