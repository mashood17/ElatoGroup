# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Testing

- `npm run test` — Vitest unit/component tests (`src/**/__tests__`), jsdom + React Testing Library.
- `npm run test:coverage` — same, with a coverage report.
- `npm run e2e` — Playwright E2E specs (`e2e/`), against a local Vite dev server. Backend API calls made by the app are mocked at the network layer (`e2e/fixtures/api-mocks.ts`) so these don't depend on a live `elato-backend`/Supabase.
- `npm run e2e:ui` — same, in Playwright's interactive UI mode.
- `npx lhci autorun` — Lighthouse CI against the production build (`lighthouserc.cjs`); run `npm run build` first.

## Deployment (Vercel)

`vercel.json` sets the framework preset, build/output config, and SPA rewrites (react-router needs every path to resolve to `index.html`). It also sets baseline security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).

`Strict-Transport-Security` and `Content-Security-Policy` are intentionally **not** set yet — both need to be finalized against the real production domain (CSP in particular needs the actual set of external origins the app talks to: the FastAPI backend, fonts, analytics) once one exists, rather than guessed at now.
