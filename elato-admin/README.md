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

- `npm run test` — Vitest unit/component tests (`src/**/__tests__`, `src/test/`), jsdom + React Testing Library.
- `npm run test:coverage` — same, with a coverage report.

## Deployment (Vercel)

`vercel.json` sets the framework preset, build/output config, SPA rewrites (react-router), and baseline security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, plus `X-Robots-Tag: noindex` since this is an internal admin panel, not public content).

`Strict-Transport-Security` and `Content-Security-Policy` are intentionally **not** set yet — both need to be finalized against the real production domain once one exists, rather than guessed at now.
