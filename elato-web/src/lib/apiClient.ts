/**
 * Thin fetch wrapper for the FastAPI backend. Every repository/service call
 * goes through here — no component calls `fetch` directly. Parses the
 * backend's standard error shape ({"error": {"code","message"}}) into a
 * typed `ApiError` so callers can show a real message instead of "failed".
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (res.status === 204) return undefined as T

  const body = await res.json().catch(() => null)

  if (!res.ok) {
    const errorBody = body?.error ?? { code: 'unknown_error', message: 'Something went wrong.' }
    throw new ApiError(errorBody.code, errorBody.message, res.status)
  }

  return body as T
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' })
}

export function apiPost<T>(path: string, data: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(data) })
}
