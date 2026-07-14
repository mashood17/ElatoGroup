import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { trackEvent } from '../analytics'

function jsonResponse(body: unknown, status = 200) {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response
}

describe('trackEvent', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue(jsonResponse({}, 204))
    delete (window as unknown as { gtag?: unknown }).gtag
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('POSTs the event to /api/v1/analytics/events with page and metadata', async () => {
    trackEvent('whatsapp_click', 'celebre', { itemCount: 2 })
    await Promise.resolve()
    await Promise.resolve()

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/analytics\/events$/),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ event_name: 'whatsapp_click', page: 'celebre', metadata: { itemCount: 2 } }),
      }),
    )
  })

  it('mirrors the call to window.gtag when present', () => {
    const gtag = vi.fn()
    window.gtag = gtag
    trackEvent('enquiry_submitted', 'stay', { guests: 4 })
    expect(gtag).toHaveBeenCalledWith('event', 'enquiry_submitted', { page: 'stay', guests: 4 })
  })

  it('does not throw when window.gtag is not set', () => {
    expect(() => trackEvent('booking_click', 'stay')).not.toThrow()
  })

  it('never throws even if the backend call rejects', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('network error'))
    expect(() => trackEvent('order_generated', 'celebre')).not.toThrow()
    await Promise.resolve()
    await Promise.resolve()
  })
})
