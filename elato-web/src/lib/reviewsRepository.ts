/** Real data-access layer for featured reviews, backed by `/api/v1/reviews/featured`. */
import { apiGet } from './apiClient'

export type ReviewDto = {
  id: string
  author_name: string | null
  rating: number | null
  text: string | null
}

export type Review = { id: string; author: string; rating: number; text: string }

export async function getFeaturedReviews(): Promise<Review[]> {
  const rows = await apiGet<ReviewDto[]>('/api/v1/reviews/featured')
  return rows.map((r) => ({
    id: r.id,
    author: r.author_name ?? 'A guest',
    rating: r.rating ?? 5,
    text: r.text ?? '',
  }))
}
