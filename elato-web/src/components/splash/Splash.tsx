import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { HeroWordmark } from '../hero/HeroWordmark'
import heroLogo from '../../assets/logos/elato-logo-home.svg'
import { SPLASH_DURATION_MS, getNavbarLogoEl, markSplashExiting, shouldPlaySplash } from '../../lib/splashState'

const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const
const EXIT_FADE_S = 0.7
// Matches Navbar's `duration-300` opacity transition. The flying logo is
// pixel-identical to the navbar's own asset, already sitting at its resting
// rect once the flight lands — keeping it mounted for exactly as long as the
// real navbar takes to fade in underneath makes removing it an invisible
// no-op instead of a flicker.
const NAV_REVEAL_MS = 300

type Rect = { top: number; left: number; width: number; height: number }

/**
 * First-load/refresh-only splash — plays the same wordmark animation the
 * Hero used to open on, then hands off to the navbar. Never shown on SPA
 * navigation (see splashState.ts for the "first load vs. nav" detection).
 *
 * The handoff is one single visible logo throughout, never two: at the
 * moment the hold ends, the splash measures its own wordmark's rect and the
 * navbar logo's resting rect (already mounted, just invisible behind the
 * still-hidden header), then swaps to a single `motion.img` — using the
 * *navbar's own asset* — positioned at that exact starting rect and
 * animated to the navbar's resting rect. Only once that flight lands does
 * the splash unmount and the real (now-visible) navbar logo take over — by
 * then it's pixel-identical to where the flying image just landed, so the
 * swap is invisible.
 *
 * (An earlier version shared a single Framer Motion `layoutId` between the
 * splash logo and the navbar logo to get this morph "for free". In
 * practice that left a stray Web Animations API opacity effect stuck on the
 * navbar header — Framer Motion's automatic crossfade between two
 * differently-keyed elements in different DOM subtrees didn't resolve
 * cleanly. Measuring rects directly, as below, is more code but behaves
 * deterministically.)
 */
export function Splash() {
  const reduceMotion = useReducedMotion()
  const [shouldRender] = useState(() => shouldPlaySplash())
  const [phase, setPhase] = useState<'hold' | 'flying' | 'done'>('hold')
  const [fromRect, setFromRect] = useState<Rect | null>(null)
  const [toRect, setToRect] = useState<Rect | null>(null)
  const [flightSrc, setFlightSrc] = useState(heroLogo)
  const logoRef = useRef<HTMLImageElement>(null)
  const revealTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (revealTimerRef.current !== null) window.clearTimeout(revealTimerRef.current)
    }
  }, [])

  // Reduced-motion (or a repeat mount within the same session) bails before
  // paint so the navbar is never stuck hidden behind a splash that isn't
  // going to play.
  useLayoutEffect(() => {
    if (!shouldRender || reduceMotion) {
      markSplashExiting()
    }
  }, [shouldRender, reduceMotion])

  useEffect(() => {
    if (!shouldRender || reduceMotion) return
    const timer = window.setTimeout(() => {
      const fromEl = logoRef.current
      const toEl = getNavbarLogoEl()
      if (fromEl && toEl) {
        const from = fromEl.getBoundingClientRect()
        const to = toEl.getBoundingClientRect()
        setFromRect({ top: from.top, left: from.left, width: from.width, height: from.height })
        setToRect({ top: to.top, left: to.left, width: to.width, height: to.height })
        setFlightSrc(toEl.getAttribute('src') ?? heroLogo)
        setPhase('flying')
      } else {
        setPhase('done')
        markSplashExiting()
      }
    }, SPLASH_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [shouldRender, reduceMotion])

  if (!shouldRender || reduceMotion || phase === 'done') return null

  return (
    <>
      <AnimatePresence>
        {phase === 'hold' && (
          <motion.div
            key="splash-bg"
            className="fixed inset-0 z-[9999] bg-splash"
            aria-hidden="true"
            exit={{ opacity: 0 }}
            transition={{ duration: EXIT_FADE_S, ease: EASE_CINEMATIC }}
          />
        )}
      </AnimatePresence>

      {phase === 'hold' && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center" aria-hidden="true">
          <HeroWordmark
            ref={logoRef}
            src={heroLogo}
            alt="ELATŌ"
            width={1000}
            height={400}
            className="shrink-0 w-[min(141vw,345vh)] sm:w-[min(94vw,230vh)]"
          />
        </div>
      )}

      {phase === 'flying' && fromRect && toRect && (
        <motion.img
          src={flightSrc}
          alt="ELATŌ"
          aria-hidden="true"
          initial={{ top: fromRect.top, left: fromRect.left, width: fromRect.width, height: fromRect.height }}
          animate={{ top: toRect.top, left: toRect.left, width: toRect.width, height: toRect.height }}
          transition={{ duration: EXIT_FADE_S, ease: EASE_CINEMATIC }}
          onAnimationComplete={() => {
            // Reveal the real navbar now — it fades in via CSS opacity
            // underneath this flying image, which stays put (identical
            // asset, identical rect) until that fade-in finishes.
            markSplashExiting()
            revealTimerRef.current = window.setTimeout(() => setPhase('done'), NAV_REVEAL_MS)
          }}
          className="fixed z-[10000]"
        />
      )}
    </>
  )
}
