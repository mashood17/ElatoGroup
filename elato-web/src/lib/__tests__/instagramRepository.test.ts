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

  it('maps permalink/caption/video_url with fallbacks for nulls, prefers thumbnail_url, and preserves is_reel', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse([
        {
          id: 'ig-1',
          media_type: 'VIDEO',
          is_reel: true,
          thumbnail_url: 'https://example.com/a-thumb.jpg',
          media_url: 'https://example.com/a.mp4',
          video_url: 'https://example.com/a-hosted.mp4',
          permalink: 'https://instagram.com/p/1',
          caption: 'A sundae.',
          posted_at: '2026-01-01T00:00:00Z',
        },
        {
          id: 'ig-2',
          media_type: 'VIDEO',
          is_reel: true,
          thumbnail_url: null,
          media_url: 'https://example.com/b.mp4',
          video_url: null,
          permalink: null,
          caption: null,
          posted_at: null,
        },
      ]),
    )
    const result = await getLatestInstagramPosts()
    expect(result).toEqual([
      {
        id: 'ig-1',
        permalink: 'https://instagram.com/p/1',
        caption: 'A sundae.',
        mediaUrl: 'https://example.com/a-thumb.jpg',
        videoUrl: 'https://example.com/a-hosted.mp4',
        isReel: true,
      },
      { id: 'ig-2', permalink: '#', caption: '', mediaUrl: 'https://example.com/b.mp4', videoUrl: null, isReel: true },
    ])
  })
})
