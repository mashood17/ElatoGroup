import type { AdminOut } from "../types/api";

/**
 * Token storage strategy (documented tradeoff):
 *
 * This is a pure SPA calling a separate API origin, so a real httpOnly
 * cookie session isn't available to us — the browser can't be told "attach
 * this cookie only for this API host" from client-side JS, and the backend
 * issues bearer JWTs, not cookies. Given that constraint we split storage:
 *
 *  - Access token: kept in memory only (module-level variable below). It
 *    never touches localStorage, so it can't be lifted by a persisted-storage
 *    read (e.g. a malicious browser extension enumerating localStorage) and
 *    it disappears on tab close/reload — acceptable since it's short-lived
 *    (~15 min) and we transparently refresh it.
 *  - Refresh token: persisted in localStorage so a page reload doesn't force
 *    a re-login. This is the standard SPA tradeoff (localStorage is
 *    readable by any script on the page, i.e. vulnerable to XSS) — it's
 *    accepted here because the backend rotates the refresh token on every
 *    use (old one is invalidated), which bounds the blast radius of a
 *    leaked token to a single use before rotation detection.
 *  - Admin profile (id/email/role): also persisted in localStorage so we
 *    can restore "who's logged in" without a dedicated `/admin/auth/me`
 *    endpoint (none exists on the backend). It's non-sensitive — no
 *    credentials — but it IS trusted for role-gating UI, so it's re-synced
 *    from the server on every login and whenever `/admin/users` is fetched
 *    for the current admin.
 */

const REFRESH_TOKEN_KEY = "elato_admin_refresh_token";
const ADMIN_PROFILE_KEY = "elato_admin_profile";

let inMemoryAccessToken: string | null = null;

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null): void {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function getStoredAdmin(): AdminOut | null {
  const raw = localStorage.getItem(ADMIN_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminOut;
  } catch {
    return null;
  }
}

export function setStoredAdmin(admin: AdminOut | null): void {
  if (admin) {
    localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(admin));
  } else {
    localStorage.removeItem(ADMIN_PROFILE_KEY);
  }
}

export function clearSession(): void {
  setAccessToken(null);
  setRefreshToken(null);
  setStoredAdmin(null);
}
