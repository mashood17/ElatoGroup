import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "../api/auth";
import { SESSION_EXPIRED_EVENT, refreshSession } from "../lib/api-client";
import {
  clearSession,
  getRefreshToken,
  getStoredAdmin,
  setAccessToken,
  setRefreshToken,
  setStoredAdmin,
} from "../lib/auth-storage";
import type { AdminOut, AdminRole } from "../types/api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  admin: AdminOut | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: AdminRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminOut | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // On boot, try to silently restore a session from the persisted refresh
  // token + cached admin profile (see lib/auth-storage.ts for why the
  // access token itself is never persisted).
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const refreshToken = getRefreshToken();
      const storedAdmin = getStoredAdmin();
      if (!refreshToken || !storedAdmin) {
        setStatus("unauthenticated");
        return;
      }
      try {
        // Routed through the same dedup guard as the 401 interceptor
        // (see lib/api-client.ts) — under React StrictMode this effect
        // runs twice; without the shared guard both invocations would
        // race the same (single-use, rotating) refresh token and one
        // would always fail, force-logging-out a session that was fine.
        await refreshSession();
        if (cancelled) return;
        setAdmin(storedAdmin);
        setStatus("authenticated");
      } catch {
        if (cancelled) return;
        clearSession();
        setStatus("unauthenticated");
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  // The api-client dispatches this when a background refresh fails
  // (refresh token expired/rotated elsewhere) — force back to the login screen.
  useEffect(() => {
    function handleSessionExpired() {
      setAdmin(null);
      setStatus("unauthenticated");
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setAccessToken(res.access_token);
    setRefreshToken(res.refresh_token);
    setStoredAdmin(res.admin);
    setAdmin(res.admin);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      await authApi.logout({ refresh_token: refreshToken, everywhere: false });
    } catch {
      // Best-effort: even if the network call fails, clear the local
      // session so the UI can't keep acting as this admin.
    }
    clearSession();
    setAdmin(null);
    setStatus("unauthenticated");
  }, []);

  const hasRole = useCallback((...roles: AdminRole[]) => !!admin && roles.includes(admin.role), [admin]);

  const value = useMemo<AuthContextValue>(
    () => ({ admin, status, login, logout, hasRole }),
    [admin, status, login, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
