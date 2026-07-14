import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getFeaturedEvents } from '../eventsRepository'

// eventsRepository.ts is now backed by a real FastAPI backend
// (`/api/v1/event-packages`), not `eventsContent.ts` — so these tests mock
// `fetch` and assert on the DTO -> domain-model mapping, in particular the
// `capacityLabel` logic derived from min_guests/max_guests.

function jsonResponse(body: unknown, status = 200) {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response
}

describe('getFeaturedEvents', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('maps DTOs to the FeaturedEvent shape and sorts by display_order', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse([
        { id: 'ev-birthday', title: 'Birthday Parties', description: 'A table set well.', min_guests: 20, max_guests: 100, display_order: 1 },
        { id: 'ev-weddings', title: 'Weddings', description: null, min_guests: 200, max_guests: 250, display_order: 0 },
      ]),
    )

    const result = await getFeaturedEvents()
    expect(result.map((e) => e.id)).toEqual(['ev-weddings', 'ev-birthday'])
    expect(result[0]).toEqual({
      id: 'ev-weddings',
      title: 'Weddings',
      description: '',
      capacity: '200–250 guests',
      sortOrder: 0,
    })
  })

  it('labels capacity as "Up to N guests" when only max_guests is set', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse([{ id: 'ev-1', title: 'Corporate', description: '', min_guests: null, max_guests: 250, display_order: 0 }]),
    )
    const result = await getFeaturedEvents()
    expect(result[0].capacity).toBe('Up to 250 guests')
  })

  it('labels capacity as "From N guests" when only min_guests is set', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse([{ id: 'ev-1', title: 'Corporate', description: '', min_guests: 20, max_guests: null, display_order: 0 }]),
    )
    const result = await getFeaturedEvents()
    expect(result[0].capacity).toBe('From 20 guests')
  })

  it('falls back to "Guest count on request" when neither is set', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse([{ id: 'ev-1', title: 'Corporate', description: '', min_guests: null, max_guests: null, display_order: 0 }]),
    )
    const result = await getFeaturedEvents()
    expect(result[0].capacity).toBe('Guest count on request')
  })

  it('propagates a rejection when the request fails', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ error: { code: 'server_error', message: 'oops' } }, 500))
    await expect(getFeaturedEvents()).rejects.toMatchObject({ status: 500 })
  })
})
