import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const

// Timing budget for the "card -> destination" cinematic. The clicked card's
// photograph expands from its own rect to fill the viewport (EXPAND_MS),
// holds there fully opaque while the route swap happens underneath
// (HOLD_MS), then fades out (FADE_MS) to reveal the destination page's own
// hero, which has been rendering — and already playing its own entrance
// animation — behind the overlay the whole time.
//
// No destination page reports a landing target anymore: every hero (Home/
// Stay/Celebré/Events) is now the same shell with no per-page photograph to
// land on, so the clone simply grows to fill the screen rather than flying
// to a specific element.
export const EXPAND_MS = 550
export const HOLD_MS = 160
export const FADE_MS = 420

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
  beginCardTransition: (payload: CardTransitionPayload) => void
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

  const beginCardTransition = useCallback(
    (payload: CardTransitionPayload) => {
      if (pending !== null) return // already transitioning — ignore repeat clicks

      if (reduceMotion) {
        navigate(payload.href)
        return
      }

      setPending(payload)
      // The destination page mounts scrolled to the top, underneath the
      // still-opaque overlay — can't wait for the App-level ScrollToTop
      // effect, which fires a tick later than this.
      window.scrollTo(0, 0)
      navigate(payload.href)
    },
    [navigate, reduceMotion, pending],
  )

  // Total lifetime of one transition: expand to fullscreen, hold opaque
  // (route swap happens here, invisibly), fade out to reveal the
  // destination. Clears itself once that sequence has fully played out.
  useEffect(() => {
    if (!pending) return
    const t = window.setTimeout(() => setPending(null), EXPAND_MS + HOLD_MS + FADE_MS)
    return () => window.clearTimeout(t)
  }, [pending])

  const value = useMemo<PageTransitionContextValue>(
    () => ({
      isTransitioning: pending !== null,
      pendingId: pending?.id ?? null,
      beginCardTransition,
    }),
    [pending, beginCardTransition],
  )

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      <TransitionOverlay pending={pending} />
    </PageTransitionContext.Provider>
  )
}

function TransitionOverlay({ pending }: { pending: CardTransitionPayload | null }) {
  const totalS = (EXPAND_MS + HOLD_MS + FADE_MS) / 1000
  const holdStartFraction = EXPAND_MS / (EXPAND_MS + HOLD_MS + FADE_MS)
  const fadeStartFraction = (EXPAND_MS + HOLD_MS) / (EXPAND_MS + HOLD_MS + FADE_MS)

  return (
    <AnimatePresence>
      {pending && (
        // Deliberately animates real top/left/width/height rather than a
        // scale transform: the child is a `background-size: cover` photo,
        // whose crop window is computed from this box's actual layout size
        // every frame. A transform-only fake (scale a full-viewport box down
        // to the card's rect) would lay the image out cover-cropped for the
        // *end* size from frame one, so it'd visually jump to the wrong crop
        // the instant the overlay appears. Real layout animation keeps the
        // crop window growing in lockstep with the box, which is what makes
        // this read as the photo continuously, smoothly filling the screen.
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
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            borderRadius: 0,
            // Fully opaque through the expand + hold phases (that's what
            // hides the route swap happening underneath), then a single
            // premium fade at the very end reveals the destination hero.
            opacity: [1, 1, 0],
          }}
          transition={{
            top: { duration: EXPAND_MS / 1000, ease: EASE_CINEMATIC },
            left: { duration: EXPAND_MS / 1000, ease: EASE_CINEMATIC },
            width: { duration: EXPAND_MS / 1000, ease: EASE_CINEMATIC },
            height: { duration: EXPAND_MS / 1000, ease: EASE_CINEMATIC },
            borderRadius: { duration: EXPAND_MS / 1000, ease: EASE_CINEMATIC },
            opacity: { duration: totalS, times: [0, holdStartFraction, 1], ease: EASE_CINEMATIC },
          }}
          exit={{ opacity: 0, transition: { duration: FADE_MS / 1000, ease: EASE_CINEMATIC } }}
        >
          {/* The photograph itself — a very slight independent zoom layered under the container's flight, so the image feels alive rather than just sliding. */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${pending.imageSrc})` }}
            initial={{ scale: 1 }}
            animate={{ scale: 1.08, transition: { duration: (EXPAND_MS + HOLD_MS) / 1000, ease: EASE_CINEMATIC } }}
          />

          {/* Soft vignette, settling in as the image fills the screen. */}
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

          {/* Final darkening beat right before the fade, so the cut to the
              destination hero (which opens on its own dark video overlay)
              never reads as a brightness pop. */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-[#0f0a06]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.22, 0], transition: { duration: totalS, times: [0, holdStartFraction, fadeStartFraction, 1], ease: EASE_CINEMATIC } }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
