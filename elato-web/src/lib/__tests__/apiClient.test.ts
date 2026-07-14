import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiGet, apiPost, ApiError } from '../apiClient'

function jsonResponse(body: unknown, status = 200) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  } as Response
}

describe('apiClient', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  describe('apiGet', () => {
    it('resolves the parsed JSON body on a 2xx response', async () => {
      vi.mocked(fetch).mockResolvedValue(jsonResponse({ hello: 'world' }))
      const result = await apiGet<{ hello: string }>('/api/v1/ping')
      expect(result).toEqual({ hello: 'world' })
    })

    it('calls fetch with the configured base URL and GET method', async () => {
      vi.mocked(fetch).mockResolvedValue(jsonResponse([]))
      await apiGet('/api/v1/categories')
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/v1\/categories$/),
        expect.objectContaining({ method: 'GET' }),
      )
    })

    it('returns undefined for a 204 No Content response without parsing a body', async () => {
      const jsonSpy = vi.fn()
      vi.mocked(fetch).mockResolvedValue({ status: 204, ok: true, json: jsonSpy } as unknown as Response)
      const result = await apiGet('/api/v1/analytics/events')
      expect(result).toBeUndefined()
      expect(jsonSpy).not.toHaveBeenCalled()
    })

    it('throws a typed ApiError with code/message/status on a non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValue(
        jsonResponse({ error: { code: 'not_found', message: 'Category not found.' } }, 404),
      )
      await expect(apiGet('/api/v1/categories/missing')).rejects.toMatchObject({
        code: 'not_found',
        message: 'Category not found.',
        status: 404,
      })
      await expect(apiGet('/api/v1/categories/missing')).rejects.toBeInstanceOf(ApiError)
    })

    it('falls back to a generic error when the error body is missing/unparseable', async () => {
      vi.mocked(fetch).mockResolvedValue({
        status: 500,
        ok: false,
        json: async () => {
          throw new Error('not json')
        },
      } as unknown as Response)

      await expect(apiGet('/api/v1/categories')).rejects.toMatchObject({
        code: 'unknown_error',
        status: 500,
      })
    })
  })

  describe('apiPost', () => {
    it('sends a JSON-stringified body with the POST method', async () => {
      vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: '1' }, 201))
      await apiPost('/api/v1/enquiries', { name: 'Ayesha', phone: '+919876543210' })

      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/v1\/enquiries$/),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Ayesha', phone: '+919876543210' }),
        }),
      )
    })

    it('sets the Content-Type header to application/json', async () => {
      vi.mocked(fetch).mockResolvedValue(jsonResponse({}, 201))
      await apiPost('/api/v1/enquiries', {})
      const [, init] = vi.mocked(fetch).mock.calls[0]
      expect((init as RequestInit).headers).toMatchObject({ 'Content-Type': 'application/json' })
    })

    it('propagates ApiError on failure the same way apiGet does', async () => {
      vi.mocked(fetch).mockResolvedValue(
        jsonResponse({ error: { code: 'validation_error', message: 'Phone is required.' } }, 422),
      )
      await expect(apiPost('/api/v1/enquiries', {})).rejects.toMatchObject({
        code: 'validation_error',
        status: 422,
      })
    })
  })
})
