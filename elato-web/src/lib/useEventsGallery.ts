import { useEffect, useState } from 'react'
import { getEventsGallery, type EventsGalleryImage } from './eventsGalleryRepository'

export type EventsGalleryState = {
  status: 'loading' | 'ready' | 'empty'
  images: EventsGalleryImage[]
}

/**
 * Live admin-managed Events gallery from GET /api/v1/gallery?category=events,
 * powering the "Captured Moments" section. `empty` covers both "no photos
 * yet" and a failed request, so the section falls back to its static
 * placeholder tiles and never looks broken.
 */
export function useEventsGallery(): EventsGalleryState {
  const [state, setState] = useState<EventsGalleryState>({ status: 'loading', images: [] })

  useEffect(() => {
    let cancelled = false
    getEventsGallery()
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
