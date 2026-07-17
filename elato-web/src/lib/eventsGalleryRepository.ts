/**
 * Real data-access layer for the admin-managed Events gallery, backed by
 * `GET /api/v1/gallery?category=events`. These are the photos an admin adds
 * under Events → Events Gallery in the admin panel; shown on the public
 * Events page's "Captured Moments" section.
 */
import { apiGet } from './apiClient'

type GalleryItemDto = {
  id: string
  media_id: string
  category: string | null
  caption: string | null
  display_order: number
  media_url: string | null
}

export type EventsGalleryImage = {
  id: string
  url: string
  caption: string
}

export async function getEventsGallery(): Promise<EventsGalleryImage[]> {
  const rows = await apiGet<GalleryItemDto[]>('/api/v1/gallery?category=events')
  return rows
    .filter((r): r is GalleryItemDto & { media_url: string } => Boolean(r.media_url))
    .sort((a, b) => a.display_order - b.display_order)
    .map((r) => ({
      id: r.id,
      url: r.media_url,
      caption: r.caption ?? '',
    }))
}
