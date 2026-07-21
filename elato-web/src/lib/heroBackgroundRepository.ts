/**
 * Read-access for admin-managed hero background videos (backed by
 * `GET /api/v1/hero-backgrounds`) — replaces the old fixed `public/videos/`
 * asset convention entirely. One entry per slot ('desktop' | 'mobile'), each
 * carrying its video URL/mime, optional poster URL, and probed metadata.
 *
 * Cached as a single shared in-flight/settled promise per page load, same
 * pattern as siteContentRepository — every hero on the page resolves from
 * one request. A failed request (or a slot with nothing uploaded yet)
 * settles to a missing entry: the hero then renders with no video, just the
 * overlay's base color, rather than a broken asset.
 */
import { apiGet } from './apiClient'

export type HeroSlot = 'desktop' | 'mobile'

export interface HeroBackgroundDto {
  slot: HeroSlot
  video_url: string
  video_mime: string
  poster_url: string | null
  width: number | null
  height: number | null
  duration_seconds: number | null
  file_size_bytes: number
  updated_at: string
}

let cache: Promise<Partial<Record<HeroSlot, HeroBackgroundDto>>> | null = null

export function getHeroBackgrounds(): Promise<Partial<Record<HeroSlot, HeroBackgroundDto>>> {
  if (!cache) {
    cache = apiGet<HeroBackgroundDto[]>('/api/v1/hero-backgrounds')
      .then((rows) => {
        const map: Partial<Record<HeroSlot, HeroBackgroundDto>> = {}
        for (const row of rows) map[row.slot] = row
        return map
      })
      .catch(() => ({}))
  }
  return cache
}
