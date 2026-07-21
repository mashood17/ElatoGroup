import axios from "axios";
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, isApiBaseUrlMisconfigured } from "./env";
import { clearSession, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from "./auth-storage";
import type { AccessTokenResponse, ApiErrorBody } from "../types/api";

/** Fired when the session is force-terminated (refresh failed). AuthContext
 * listens for this to clear its state and redirect to /login without this
 * module needing to import React or the router. */
export const SESSION_EXPIRED_EVENT = "elato-admin:session-expired";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (isApiBaseUrlMisconfigured) {
    throw new ApiError("config_error", "API base URL is not configured for this deployment.", undefined);
  }
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

/** Normalized error shape thrown by every apiClient call so UI code never
 * has to poke at axios internals to show a message. */
export class ApiError extends Error {
  code: string;
  status: number | undefined;

  constructor(code: string, message: string, status: number | undefined) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function toApiError(error: AxiosError<ApiErrorBody>): ApiError {
  const body = error.response?.data;
  if (body && "error" in body) {
    return new ApiError(body.error.code, body.error.message, error.response?.status);
  }
  if (error.code === "ERR_NETWORK") {
    return new ApiError("network_error", "Could not reach the server. Check your connection and try again.", undefined);
  }
  return new ApiError("unknown_error", error.message || "Something went wrong.", error.response?.status);
}

// Concurrent-request-safe refresh: if several requests 401 at once — or
// AuthContext's boot-time restore races a 401 retry, e.g. under React
// StrictMode's double-effect-invocation in dev — we only want a single
// refresh call in flight against the rotating refresh token, and everyone
// else (including AuthContext.bootstrap, via refreshSession() below) awaits
// its result instead of firing their own concurrent call. Two concurrent
// calls with the same refresh token would race: the backend revokes the
// token on first use, so the loser fails and force-logs-out a session that
// should have stayed valid.
let refreshPromise: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  if (isApiBaseUrlMisconfigured) {
    throw new ApiError("config_error", "API base URL is not configured for this deployment.", undefined);
  }
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available.");
  }
  const response = await axios.post<AccessTokenResponse>(`${API_BASE_URL}/api/v1/admin/auth/refresh`, {
    refresh_token: refreshToken,
  });
  setAccessToken(response.data.access_token);
  setRefreshToken(response.data.refresh_token);
  return response.data.access_token;
}

/** Public entry point for anything outside this module that needs to refresh
 * the session (currently: AuthContext's boot-time restore) — always routes
 * through the same dedup guard as the 401 interceptor below. */
export function refreshSession(): Promise<string> {
  refreshPromise ??= performRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const status = error.response?.status;
    const isAuthEndpoint = originalRequest?.url?.includes("/admin/auth/");

    if (status === 401 && originalRequest && !originalRequest._retried && !isAuthEndpoint) {
      originalRequest._retried = true;
      try {
        const newAccessToken = await refreshSession();
        originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
        return apiClient(originalRequest);
      } catch {
        clearSession();
        window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
        return Promise.reject(toApiError(error));
      }
    }

    return Promise.reject(toApiError(error));
  },
);

/** Thin typed wrappers so callers never see axios's `AxiosResponse` noise. */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<T>(url, config);
  return res.data;
}

export async function apiPost<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.post<T>(url, data, config);
  return res.data;
}

export async function apiPatch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.patch<T>(url, data, config);
  return res.data;
}

export async function apiPut<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.put<T>(url, data, config);
  return res.data;
}

export async function apiDelete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
}
