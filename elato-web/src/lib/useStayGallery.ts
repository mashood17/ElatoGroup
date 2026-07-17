import { useEffect, useState } from 'react'
import { getStayGallery, type StayGalleryImage } from './stayGalleryRepository'

export type StayGalleryState = {
  status: 'loading' | 'ready' | 'empty'
  images: StayGalleryImage[]
}

/**
 * Live admin-managed Stay gallery from GET /api/v1/gallery?category=stay,
 * shared by the "Boutique Retreat" (Amenities) and "A Glimpse Inside"
 * (StayGallery) sections so both render the exact same photo set the admin
 * curated. `empty` covers both "no photos yet" and a failed request, so each
 * section can fall back to its own static visuals and never look broken.
 */
export function useStayGallery(): StayGalleryState {
  const [state, setState] = useState<StayGalleryState>({ status: 'loading', images: [] })

  useEffect(() => {
    let cancelled = false
    getStayGallery()
      .then((images) => {
        if (cancelled) return
        setState({ status: images.length > 0 ? 'ready' : 'empty', images })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'empty', images: [] })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
