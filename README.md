# ELATŌ

Monorepo for the ELATŌ platform — a premium dessert café, boutique stay, and celebration destination in Mangalore, India. The full product specification lives in [`docs/ELATO_Product_Requirements_Document.docx`](docs/ELATO_Product_Requirements_Document.docx).

## Structure

```
Elato/
├── elato-web/       Public website — React + Vite + TypeScript + Tailwind CSS + Framer Motion
├── elato-admin/      Admin CMS — React + Vite + TypeScript + Tailwind CSS
├── elato-backend/    API — FastAPI + Python
└── docs/            Shared project documentation (PRD, etc.)
```

Each app is fully independent: its own `package.json`/`requirements.txt`, its own `src`, its own build tooling. Nothing is shared between them yet — no shared package, no monorepo tool (Turborepo/Nx) is in use. They're grouped under one root purely for organization.

## Apps

### `elato-web` — Public Website

The customer-facing site: Home, Stay, Celebré, and Events pages.

```bash
cd elato-web
npm install
npm run dev      # http://localhost:5173
npm run build
```

**Status:** frontend for 4 public pages built (Home, Stay, Celebré, Events). No backend connection yet — content is served from typed mock repositories shaped like the future API responses. See the implementation audit for the full status breakdown.

### `elato-admin` — Admin CMS

Where the business will manage menu items, categories, specials, gallery images, and enquiries.

```bash
cd elato-admin
npm install
npm run dev      # http://localhost:5174
npm run build
```

**Status:** scaffold only — no screens implemented yet.

### `elato-backend` — API

FastAPI service backing both `elato-web` and `elato-admin`.

```bash
cd elato-backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000    # http://localhost:8000/health
```

**Status:** scaffold only — a single `/health` check exists. No database, auth, or business endpoints yet. See `elato-backend/README.md` for its internal folder structure.

## Roadmap

This restructuring is a dedicated architectural milestone, done ahead of Sprint 2 (Database + Backend implementation) so that backend and admin work start against a clean, independent-app layout rather than being bolted onto the original single-app frontend project.
