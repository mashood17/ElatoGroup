import { useEffect, useState } from 'react'
import { getSiteImages } from './siteContentRepository'

/**
 * Resolve a single admin-managed section image key to its URL, starting from
 * (and always falling back to) the bundled static asset. The static asset
 * renders immediately; if the admin has uploaded a replacement for `key`, it
 * swaps in once `site_content` loads. The design/dimensions never change —
 * only the image source.
 */
export function useSiteImage(key: string, fallback: string): string {
  const [url, setUrl] = useState<string>(fallback)

  useEffect(() => {
    let cancelled = false
    getSiteImages().then((map) => {
      if (!cancelled && map[key]) setUrl(map[key])
    })
    return () => {
      cancelled = true
    }
  }, [key])

  return url
}

/**
 * Multi-slot variant for sections that render several admin-managed images at
 * once (e.g. the homepage Services cards). Pass a `{ key: staticFallback }`
 * map; returns the same shape with any admin-provided URLs swapped in. Keys
 * and fallbacks are expected to be stable for the component's lifetime.
 */
export function useSiteImages(fallbacks: Record<string, string>): Record<string, string> {
  const [images, setImages] = useState<Record<string, string>>(fallbacks)

  useEffect(() => {
    let cancelled = false
    getSiteImages().then((map) => {
      if (cancelled) return
      setImages((prev) => {
        const next = { ...prev }
        let changed = false
        for (const key of Object.keys(fallbacks)) {
          if (map[key] && map[key] !== next[key]) {
            next[key] = map[key]
            changed = true
          }
        }
        return changed ? next : prev
      })
    })
    return () => {
      cancelled = true
    }
    // Keys/fallbacks are static per mount; resolving once is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return images
}
