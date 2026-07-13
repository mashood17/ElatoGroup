/** Real data-access layer for the Instagram feed cache, backed by `/api/v1/instagram/latest`. */
import { apiGet } from './apiClient'

export type InstagramPostDto = {
  id: string
  media_url: string
  permalink: string | null
  caption: string | null
}

export type InstagramItem = { id: string; permalink: string; caption: string; mediaUrl: string }

export async function getLatestInstagramPosts(): Promise<InstagramItem[]> {
  const rows = await apiGet<InstagramPostDto[]>('/api/v1/instagram/latest')
  return rows.map((r) => ({
    id: r.id,
    permalink: r.permalink ?? '#',
    caption: r.caption ?? '',
    mediaUrl: r.media_url,
  }))
}
