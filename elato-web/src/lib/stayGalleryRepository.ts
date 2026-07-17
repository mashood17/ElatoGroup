/**
 * Real data-access layer for the admin-managed Stay gallery, backed by
 * `GET /api/v1/gallery?category=stay`. These are the photos an admin adds
 * under Stay → Boutique Retreat Gallery in the admin panel; the same set is
 * shown on the public Stay page in both the "Boutique Retreat" and
 * "A Glimpse Inside" sections.
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

export type StayGalleryImage = {
  id: string
  url: string
  caption: string
}

export async function getStayGallery(): Promise<StayGalleryImage[]> {
  const rows = await apiGet<GalleryItemDto[]>('/api/v1/gallery?category=stay')
  return rows
    .filter((r): r is GalleryItemDto & { media_url: string } => Boolean(r.media_url))
    .sort((a, b) => a.display_order - b.display_order)
    .map((r) => ({
      id: r.id,
      url: r.media_url,
      caption: r.caption ?? '',
    }))
}
