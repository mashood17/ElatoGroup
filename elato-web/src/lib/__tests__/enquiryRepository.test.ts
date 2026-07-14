import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { persistEnquiry } from '../enquiryRepository'

function jsonResponse(body: unknown, status = 200) {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response
}

describe('persistEnquiry', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('POSTs the payload to /api/v1/enquiries', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: 'enq-1' }, 201))

    persistEnquiry({ source_page: 'stay', name: 'Ayesha', phone: '+919876543210' })
    // Fire-and-forget — flush microtasks before asserting.
    await Promise.resolve()
    await Promise.resolve()

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/enquiries$/),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ source_page: 'stay', name: 'Ayesha', phone: '+919876543210' }),
      }),
    )
  })

  it('is fire-and-forget: a rejected request never throws or rejects synchronously', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('network error'))
    expect(() => persistEnquiry({ source_page: 'events', name: 'Rahul', phone: '+919876543210' })).not.toThrow()
    // Let the swallowed rejection's microtask settle without an unhandled rejection.
    await Promise.resolve()
    await Promise.resolve()
  })
})
