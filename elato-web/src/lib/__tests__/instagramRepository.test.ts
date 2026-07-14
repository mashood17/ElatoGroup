import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getLatestInstagramPosts } from '../instagramRepository'

function jsonResponse(body: unknown, status = 200) {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response
}

describe('getLatestInstagramPosts', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('maps permalink/caption with fallbacks for nulls, and preserves media_url', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse([
        { id: 'ig-1', media_url: 'https://example.com/a.jpg', permalink: 'https://instagram.com/p/1', caption: 'A sundae.' },
        { id: 'ig-2', media_url: 'https://example.com/b.jpg', permalink: null, caption: null },
      ]),
    )
    const result = await getLatestInstagramPosts()
    expect(result).toEqual([
      { id: 'ig-1', permalink: 'https://instagram.com/p/1', caption: 'A sundae.', mediaUrl: 'https://example.com/a.jpg' },
      { id: 'ig-2', permalink: '#', caption: '', mediaUrl: 'https://example.com/b.jpg' },
    ])
  })
})
