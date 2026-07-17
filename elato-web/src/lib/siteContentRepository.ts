/**
 * Read-access for admin-managed section imagery stored in `site_content`
 * (backed by `GET /api/v1/site-content`). The admin panel's "section image"
 * slots (homepage Services/About, Stay hero/reserve, Events hero/plan) each
 * write a `{ media_id, url }` object under a well-known key; this resolves
 * those keys to their optimized Supabase public URL.
 *
 * Every consumer goes through `useSiteImage`, which always falls back to the
 * bundled static asset — so a missing key, an empty CMS, or a failed request
 * renders exactly the original design, never a broken image.
 */
import { apiGet } from './apiClient'

type SiteContentDto = {
  key: string
  value: unknown
  updated_at: string
}

/** The admin `SectionImageCard` persists `{ media_id, url }`. */
function extractUrl(value: unknown): string | null {
  if (value && typeof value === 'object' && 'url' in value) {
    const url = (value as { url?: unknown }).url
    if (typeof url === 'string' && url.length > 0) return url
  }
  return null
}

// One shared fetch per page load — the several section components that read
// this resolve from the same in-flight/settled promise instead of each firing
// their own request. A failed request settles to an empty map so callers use
// their static fallbacks.
let cache: Promise<Record<string, string>> | null = null

export function getSiteImages(): Promise<Record<string, string>> {
  if (!cache) {
    cache = apiGet<SiteContentDto[]>('/api/v1/site-content')
      .then((rows) => {
        const map: Record<string, string> = {}
        for (const row of rows) {
          const url = extractUrl(row.value)
          if (url) map[row.key] = url
        }
        return map
      })
      .catch(() => ({}))
  }
  return cache
}
