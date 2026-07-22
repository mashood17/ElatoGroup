import { useSyncExternalStore } from 'react'

/**
 * Single source of truth for "is the Services scene on screen" — shared by
 * every piece of floating chrome (Navbar, ScrollToTopButton,
 * FloatingOfferButton) that must not exist visually while any part of the
 * Services section is in the viewport.
 *
 * Architecture: a module-level store that the Services section *registers
 * itself into* when it mounts (see registerServicesScene). This inversion is
 * the whole point. The previous design had each chrome component look up
 * `#services` in the DOM from its own mount effect — but HomePage is a lazy
 * route chunk, so when the app-shell chrome mounted and ran that effect the
 * section didn't exist yet. The lookup returned null, the effect bailed, and
 * with `pathname` as its only dependency it never ran again: the state was
 * permanently latched to "inactive" and the chrome stayed visible through
 * the entire Services scene. No observer threshold or rect formula could fix
 * that, because the measuring code never executed. With registration driven
 * by the section's own lifecycle there is no mount-order race by
 * construction: the store has the element exactly while it exists, on any
 * route, regardless of chunk timing.
 *
 * The state itself is deterministic — pure scroll geometry, no
 * IntersectionObserver, no thresholds, no ratios. On every (rAF-throttled)
 * scroll/resize tick the section's document-space boundaries are measured
 * and compared against the viewport interval [scrollY, scrollY +
 * innerHeight]. Any overlap ⇒ active. So the chrome fades out the moment
 * the Hero → Services transition brings the section's top edge into view,
 * stays hidden for every scroll position that shows any part of Services,
 * and returns only once the section has fully left the viewport (About
 * below, or Hero above). Re-entering from either direction hides it again
 * immediately, and because the answer is recomputed from current geometry
 * on every tick, no missed event can ever latch it wrong.
 */

// Guard against sub-pixel measurement noise at exact rest positions (e.g.
// parked on Hero, where Services' top coincides with the viewport bottom):
// an overlap smaller than this is treated as no overlap, never as "inside
// the scene".
const EPSILON_PX = 1

let sectionEl: HTMLElement | null = null
let active = false
let rafId = 0
const subscribers = new Set<() => void>()

function setActive(next: boolean) {
  if (next === active) return
  active = next
  subscribers.forEach((cb) => cb())
}

function evaluate() {
  rafId = 0
  if (!sectionEl || !sectionEl.isConnected) {
    setActive(false)
    return
  }
  // Boundaries in document coordinates, measured fresh every tick so layout
  // shifts (lazy media, mobile URL-bar collapse) can never leave them stale.
  const rect = sectionEl.getBoundingClientRect()
  const sectionTop = window.scrollY + rect.top
  const sectionBottom = sectionTop + rect.height
  const viewportTop = window.scrollY
  const viewportBottom = viewportTop + window.innerHeight
  setActive(
    sectionTop < viewportBottom - EPSILON_PX &&
      sectionBottom > viewportTop + EPSILON_PX,
  )
}

function schedule() {
  if (!rafId) rafId = requestAnimationFrame(evaluate)
}

/**
 * Called by the Services section itself on mount. Returns the unregister
 * cleanup. While registered, scroll/resize keep the shared state current;
 * on unregister (route change, unmount) the state resets to inactive so the
 * chrome exists everywhere the section doesn't.
 */
export function registerServicesScene(el: HTMLElement): () => void {
  sectionEl = el
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  evaluate()
  return () => {
    if (sectionEl !== el) return
    sectionEl = null
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    cancelAnimationFrame(rafId)
    rafId = 0
    setActive(false)
  }
}

function subscribe(cb: () => void): () => void {
  subscribers.add(cb)
  return () => subscribers.delete(cb)
}

/** True while any part of the Services section is inside the viewport. */
export function useServicesSceneActive(): boolean {
  return useSyncExternalStore(subscribe, () => active, () => false)
}
