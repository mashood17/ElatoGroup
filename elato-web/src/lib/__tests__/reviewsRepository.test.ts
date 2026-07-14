import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getFeaturedReviews } from '../reviewsRepository'

function jsonResponse(body: unknown, status = 200) {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response
}

describe('getFeaturedReviews', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('maps author_name/rating/text with fallbacks for nulls', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse([
        { id: 'rev-1', author_name: 'Ayesha K.', rating: 5, text: 'Wonderful.' },
        { id: 'rev-2', author_name: null, rating: null, text: null },
      ]),
    )
    const result = await getFeaturedReviews()
    expect(result).toEqual([
      { id: 'rev-1', author: 'Ayesha K.', rating: 5, text: 'Wonderful.' },
      { id: 'rev-2', author: 'A guest', rating: 5, text: '' },
    ])
  })
})
