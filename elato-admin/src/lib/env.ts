/**
 * Central place to read build-time env vars. Never reference
 * `import.meta.env` directly elsewhere — this is the one seam.
 */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
