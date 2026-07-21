/**
 * Central place to read build-time env vars. Never reference
 * `import.meta.env` directly elsewhere — this is the one seam.
 */
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL: string = configuredBaseUrl || "http://localhost:8000";

// A production build must never fall back to `localhost` — Chrome's Local
// Network Access check treats a public page fetching a bare localhost/private
// URL as reaching into the user's local network and shows an "Access other
// apps and services on this device" permission prompt. api-client.ts checks
// this before issuing any request instead of silently using the fallback.
export const isApiBaseUrlMisconfigured: boolean = !configuredBaseUrl && import.meta.env.PROD;
