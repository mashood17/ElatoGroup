import { useEffect, useState } from 'react'
import { aggregateRating as staticAggregateRating } from '../content/siteContent'
import { getAggregateRating, type AggregateRating } from './reviewsRepository'

/**
 * Live Google rating/count from GET /api/v1/reviews/aggregate, shared by the
 * Reviews section and the About trust badge so both stay in sync with
 * whatever the Places sync last wrote. Falls back to the static value in
 * siteContent.ts while loading or if the request fails, so the number shown
 * is never blank — same loading-then-fallback pattern as reviews/Instagram.
 */
export function useAggregateRating(): AggregateRating {
  const [rating, setRating] = useState<AggregateRating>(staticAggregateRating)

  useEffect(() => {
    let cancelled = false
    getAggregateRating()
      .then((live) => {
        if (!cancelled) setRating(live)
      })
      .catch(() => {
        // Keep the static fallback already in state.
      })
    return () => {
      cancelled = true
    }
  }, [])

  return rating
}
