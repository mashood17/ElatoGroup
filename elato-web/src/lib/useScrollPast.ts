import { useEffect, useState } from 'react'

/**
 * Shared by Navbar / StickyWhatsAppBar / ScrollToTopButton — each previously
 * ran its own raw `scroll` listener that recomputed a boolean and called
 * `setState` on every single scroll event. On Android, `scroll` can fire far
 * more often than the display's actual frame rate during a fling, so all
 * three ended up re-checking (and occasionally re-rendering) many times per
 * frame. Gating the check behind `requestAnimationFrame` collapses that down
 * to at most once per painted frame, which is all any of these three ever
 * needed — the visual result (cross a pixel threshold, toggle a boolean) is
 * identical, just computed less redundantly.
 */
export function useScrollPast(getThreshold: () => number): boolean {
  const [past, setPast] = useState(() => window.scrollY > getThreshold())

  useEffect(() => {
    let ticking = false

    const check = () => {
      ticking = false
      setPast(window.scrollY > getThreshold())
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(check)
    }

    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return past
}
