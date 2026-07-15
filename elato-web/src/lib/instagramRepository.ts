/** Data-access layer for the Instagram Reels cache, backed by
 * `/api/v1/instagram/latest` — a Supabase table synced from the Instagram
 * Graph API on a schedule (see elato-backend/app/services/instagram_service.py).
 * This is the only place the frontend touches Instagram data; it never
 * calls Instagram directly. */
import { apiGet } from './apiClient'

export type InstagramPostDto = {
  id: string
  media_type: string | null
  is_reel: boolean
  thumbnail_url: string | null
  media_url: string
  permalink: string | null
  caption: string | null
  posted_at: string | null
}

export type InstagramItem = {
  id: string
  permalink: string
  caption: string
  mediaUrl: string
  isReel: boolean
}

export async function getLatestInstagramPosts(): Promise<InstagramItem[]> {
  const rows = await apiGet<InstagramPostDto[]>('/api/v1/instagram/latest')
  return rows.map((r) => ({
    id: r.id,
    permalink: r.permalink ?? '#',
    caption: r.caption ?? '',
    mediaUrl: r.thumbnail_url ?? r.media_url,
    isReel: r.is_reel,
  }))
}
