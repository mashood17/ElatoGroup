import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * Shared by PremiumLogoScene (pauses the WebGL frameloop) and the Home/
 * Premium hero backgrounds (pauses the always-on Ken Burns/light-drift CSS
 * animations) — both need the same "is this element currently on screen"
 * signal to stop paying for continuous GPU work once a hero has been
 * scrolled past, since neither the R3F render loop nor a CSS `@keyframes`
 * animation auto-pauses when its element scrolls out of view.
 *
 * Defaults to `true` so there's no flash-of-paused-state before the first
 * observer callback — every hero using this is visible at mount (the page
 * always loads scrolled to the top), so starting "in view" matches reality.
 */
export function useInView<T extends Element>(rootMargin = '150px 0px'): { ref: RefObject<T | null>; inView: boolean } {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin })
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return { ref, inView }
}
