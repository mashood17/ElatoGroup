import { useSyncExternalStore } from 'react'

/**
 * How long the splash holds on the wordmark before exiting. The one place
 * this number lives; `Splash.tsx` references it rather than repeating the
 * literal.
 */
export const SPLASH_DURATION_MS = 2800

/**
 * Single source of truth for "is the splash currently covering the page" —
 * shared by `Splash` (which owns the transition) and `Navbar` (which must
 * stay invisible, logo included, until the splash starts exiting). Mirrors
 * the external-store shape of `useServicesSceneActive`.
 *
 * `active` is seeded synchronously from `hasPlayed` at module-eval time —
 * not flipped on from an effect — so Navbar's very first render already
 * agrees with Splash's own first render on whether a splash is about to
 * play. `hasPlayed` only resets on an actual full page reload (fresh module
 * evaluation), which is the entire "first load vs. SPA nav" detection: no
 * sessionStorage, no pathname checks.
 */
let hasPlayed = false
let active = !hasPlayed

const subscribers = new Set<() => void>()

function notify() {
  subscribers.forEach((cb) => cb())
}

/** Read once, synchronously, by Splash to decide whether it has anything to play. */
export function shouldPlaySplash(): boolean {
  return !hasPlayed
}

/**
 * Called exactly once, the moment the splash begins its exit (or
 * immediately, if it's not going to play at all — e.g. reduced motion).
 * Idempotent — a second call is a no-op.
 */
export function markSplashExiting() {
  if (!active && hasPlayed) return
  hasPlayed = true
  active = false
  notify()
}

function subscribe(cb: () => void): () => void {
  subscribers.add(cb)
  return () => subscribers.delete(cb)
}

/** True while Navbar must stay hidden (splash still covering the page). */
export function useSplashActive(): boolean {
  return useSyncExternalStore(subscribe, () => active, () => false)
}

// Lets Splash measure exactly where the navbar logo rests, so its own
// wordmark can fly to that precise position/size instead of an approximate
// guess. Registered by Navbar on mount.
let navbarLogoEl: HTMLImageElement | null = null

export function setNavbarLogoEl(el: HTMLImageElement | null) {
  navbarLogoEl = el
}

export function getNavbarLogoEl(): HTMLImageElement | null {
  return navbarLogoEl
}
