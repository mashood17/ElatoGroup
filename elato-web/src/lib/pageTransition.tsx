import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const

// Timing budget for the "card -> destination hero" cinematic — unchanged
// from the original design: the clone flies for EXPAND_MS, holds for
// HOLD_MS once it has landed on the real hero image's spot, then crossfades
// into the real hero image (and the rest of the hero content) over FADE_MS.
// Exported so PremiumHero can sync its own reveal timing to the same clock.
export const EXPAND_MS = 500
export const HOLD_MS = 120
export const FADE_MS = 230

export type Rect = { top: number; left: number; width: number; height: number }

export type CardTransitionPayload = {
  /** Unique id for the clicked card — its href, since that's already unique per card. */
  id: string
  href: string
  imageSrc: string
  rect: Rect
}

type PageTransitionContextValue = {
  isTransitioning: boolean
  pendingId: string | null
  /** True while a card-triggered transition is in flight — destination heroes read this once at mount (it stays true for the whole transition) to know they should hold their content hidden and wait for `heroSettled` rather than running their own cold-load reveal delay. */
  heroFastReveal: boolean
  /** True once the flying clone has landed on the destination hero's image slot and held for a beat — the signal for the real hero image/tagline/badges to crossfade in. */
  heroSettled: boolean
  beginCardTransition: (payload: CardTransitionPayload) => void
  /** Called by the destination page's hero once its real image container has mounted, reporting where the clone should fly to. */
  reportHeroTarget: (rect: Rect) => void
}

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null)

export function usePageTransition(): PageTransitionContextValue {
  const ctx = useContext(PageTransitionContext)
  if (!ctx) {
    throw new Error('usePageTransition must be used within a PageTransitionProvider')
  }
  return ctx
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [pending, setPending] = useState<CardTransitionPayload | null>(null)
  const [targetRect, setTargetRect] = useState<Rect | null>(null)
  const [heroSettled, setHeroSettled] = useState(false)

  const beginCardTransition = useCallback(
    (payload: CardTransitionPayload) => {
      if (pending !== null) return // already transitioning — ignore repeat clicks

      if (reduceMotion) {
        navigate(payload.href)
        return
      }

      setPending(payload)
      setTargetRect(null)
      setHeroSettled(false)
      // The destination hero's image container is measured the instant it
      // mounts, so scroll must already be at the top by then — can't wait
      // for the App-level ScrollToTop effect, which fires a tick later.
      window.scrollTo(0, 0)
      navigate(payload.href)
    },
    [navigate, reduceMotion, pending],
  )

  const reportHeroTarget = useCallback((rect: Rect) => {
    setTargetRect(rect)
  }, [])

  // Once the destination hero reports where it actually lives, the clone
  // has a real target to fly to — schedule the "settled" flag for when that
  // flight (plus its hold beat) finishes, which is what tells the real hero
  // content to crossfade in.
  useEffect(() => {
    if (!targetRect) return
    const t = window.setTimeout(() => setHeroSettled(true), EXPAND_MS + HOLD_MS)
    return () => window.clearTimeout(t)
  }, [targetRect])

  // Once settled and crossfaded, the clone has fully handed off to the real
  // page — clear everything so state doesn't linger for the next visit.
  useEffect(() => {
    if (!heroSettled) return
    const t = window.setTimeout(() => {
      setPending(null)
      setTargetRect(null)
      setHeroSettled(false)
    }, FADE_MS)
    return () => window.clearTimeout(t)
  }, [heroSettled])

  // Safety net: if the destination hero never reports its position (a
  // failed chunk load, an unexpected route), bail out of the cinematic
  // instead of leaving cards permanently disabled and the clone parked
  // mid-air forever.
  useEffect(() => {
    if (!pending || targetRect) return
    const t = window.setTimeout(() => setPending(null), 4000)
    return () => window.clearTimeout(t)
  }, [pending, targetRect])

  const value = useMemo<PageTransitionContextValue>(
    () => ({
      isTransitioning: pending !== null,
      pendingId: pending?.id ?? null,
      heroFastReveal: pending !== null,
      heroSettled,
      beginCardTransition,
      reportHeroTarget,
    }),
    [pending, heroSettled, beginCardTransition, reportHeroTarget],
  )

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      <TransitionOverlay pending={pending} targetRect={targetRect} heroSettled={heroSettled} />
    </PageTransitionContext.Provider>
  )
}

function TransitionOverlay({
  pending,
  targetRect,
  heroSettled,
}: {
  pending: CardTransitionPayload | null
  targetRect: Rect | null
  heroSettled: boolean
}) {
  return (
    <AnimatePresence>
      {pending && (
        // Deliberately animates real top/left/width/height rather than a
        // scale transform: the child is a `background-size: cover` photo,
        // whose crop window is computed from this box's actual layout size
        // every frame. A transform-only fake (scale a full-viewport box down
        // to the target rect) would lay the image out cover-cropped for the
        // *end* size from frame one, so it'd visually jump to the wrong crop
        // the instant the overlay appears. Real layout animation keeps the
        // crop window growing in lockstep with the box, which is what makes
        // this read as the photo continuously travelling. Cost is bounded to
        // one `position: fixed` element (already outside document flow), so
        // it doesn't force a page-wide reflow.
        //
        // Until the destination hero reports its real position, `targetRect`
        // is null and the clone simply holds at the card's own rect (no
        // fullscreen takeover, ever) — it only starts moving once it knows
        // exactly where the real hero image lives on the now-visible
        // destination page.
        <motion.div
          key={pending.id}
          className="pointer-events-none fixed z-[200] overflow-hidden"
          style={{ willChange: 'top, left, width, height, opacity' }}
          initial={{
            top: pending.rect.top,
            left: pending.rect.left,
            width: pending.rect.width,
            height: pending.rect.height,
            borderRadius: 28,
            opacity: 1,
          }}
          animate={{
            top: targetRect ? targetRect.top : pending.rect.top,
            left: targetRect ? targetRect.left : pending.rect.left,
            width: targetRect ? targetRect.width : pending.rect.width,
            height: targetRect ? targetRect.height : pending.rect.height,
            borderRadius: 28,
            opacity: heroSettled ? 0 : 1,
          }}
          transition={{
            default: { duration: EXPAND_MS / 1000, ease: EASE_CINEMATIC },
            opacity: { duration: FADE_MS / 1000, ease: EASE_CINEMATIC },
          }}
          exit={{ opacity: 0, transition: { duration: FADE_MS / 1000, ease: EASE_CINEMATIC } }}
        >
          {/* The photograph itself — a very slight independent zoom layered under the container's flight, so the image feels alive rather than just sliding. */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${pending.imageSrc})` }}
            initial={{ scale: 1 }}
            animate={{ scale: 1.06, transition: { duration: (EXPAND_MS + HOLD_MS) / 1000, ease: EASE_CINEMATIC } }}
          />

          {/* Soft vignette, settling in as the image travels. */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, transparent 42%, rgba(10,6,3,0.5) 100%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.4, ease: EASE_CINEMATIC } }}
          />

          {/* Gold light sweep, crossing the travelling image once. */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-y-0 w-1/2"
            style={{
              background:
                'linear-gradient(100deg, transparent 0%, transparent 35%, rgba(231,202,160,0.55) 50%, transparent 65%, transparent 100%)',
              mixBlendMode: 'overlay',
            }}
            initial={{ x: '-120%' }}
            animate={{ x: '220%', transition: { duration: (EXPAND_MS + HOLD_MS) / 1000, ease: [0.4, 0, 0.2, 1] } }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
