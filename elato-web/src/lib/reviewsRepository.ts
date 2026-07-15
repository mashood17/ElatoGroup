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

export type AggregateRating = { rating: number; count: number }

/** Business-wide Google rating/count, backed by `/api/v1/reviews/aggregate`.
 * Kept current by the Places sync job — callers should fall back to the
 * static `aggregateRating` in siteContent.ts on error, same as reviews. */
export async function getAggregateRating(): Promise<AggregateRating> {
  return apiGet<AggregateRating>('/api/v1/reviews/aggregate')
}
