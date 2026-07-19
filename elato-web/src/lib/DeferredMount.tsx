import { useEffect, useRef, useState, type ReactNode } from 'react'

type DeferredMountProps = {
  children: ReactNode
  /** How far below the viewport to start mounting — generous so content is
   * always ready before the user scrolls to it, never a visible pop-in. */
  rootMargin?: string
}

/**
 * Delays mounting far-below-the-fold content (data fetches, IntersectionObserver-driven
 * reveals, Framer Motion setup) until it's about to scroll into view, so that
 * work doesn't compete with the hero's own critical-path animation during
 * initial hydration. Mounts once and never unmounts, so nothing pops in and
 * out on scroll direction changes.
 */
export function DeferredMount({ children, rootMargin = '1000px 0px' }: DeferredMountProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [shouldMount, setShouldMount] = useState(false)

  useEffect(() => {
    if (shouldMount) return
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShouldMount(true)
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [shouldMount, rootMargin])

  if (shouldMount) return <>{children}</>
  return <div ref={sentinelRef} aria-hidden="true" />
}
