import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import backgroundImage from '../../assets/backgrounds/elato-background.png'

/**
 * Single fixed canvas behind every route (PRD: unified background system).
 * Fixed positioning keeps it out of document flow — no CLS, no repeated
 * per-section assets — so Home/Stay/Celebré/Events all read as one
 * continuous surface instead of stacked, differently-colored sections.
 *
 * Earlier revision mapped drift to *whole-document* scroll progress (0→1),
 * which diluted the effect to a fraction of a percent of scroll speed on a
 * multi-thousand-px page — technically live, perceptually inert. This
 * version composes two effects, both driven off raw scroll pixels/velocity
 * rather than page-length-normalized progress, so the rate stays constant
 * and visible regardless of how long any given route is:
 *  - `drift` — an "establishing" pan that completes over the first ~1.5
 *    viewport-heights of scroll, then holds (a settle, not a stop — the
 *    sway below keeps the layer live for the rest of the page).
 *  - `sway` — a small, continuously-reactive offset driven by scroll
 *    *velocity* (low-pass filtered), so the background always has a hint
 *    of weight/lag relative to the foreground while actively scrolling,
 *    for the entire length of every page, not just the first section.
 * Both are summed into one target, then spring-smoothed for inertia, and
 * applied as `y` (never `background-position`) so the browser composites
 * it on the GPU without ever repainting the image itself. The canvas is
 * deliberately oversized (top/bottom -10%) and scaled by ordinary
 * `background-size: cover` on that larger box — the same mechanism this
 * page's `cover` background already uses at every breakpoint — which
 * yields the pan headroom these two effects need without touching the
 * source image or introducing any new visual element.
 */
export function PageBackground() {
  const reduceMotion = useReducedMotion()
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)')
    const update = () => setIsCompact(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  const driftMax = reduceMotion ? 0 : isCompact ? 20 : 40
  const swayMax = reduceMotion ? 0 : isCompact ? 11 : 22
  const breatheScale = reduceMotion ? 1 : isCompact ? 1.01 : 1.02
  const DRIFT_DISTANCE = 1400 // px of scroll over which the establishing pan completes
  const SWAY_VELOCITY_REF = 2200 // px/s of scroll speed that maxes out the sway

  const targetY = useMotionValue(0)
  const lastScrollY = useRef(0)
  const lastTime = useRef(0)
  const smoothedVelocity = useRef(0)

  useEffect(() => {
    lastScrollY.current = window.scrollY
    lastTime.current = performance.now()

    const update = () => {
      const now = performance.now()
      const dt = Math.max(now - lastTime.current, 1) / 1000
      const currentY = window.scrollY
      const instantVelocity = (currentY - lastScrollY.current) / dt
      smoothedVelocity.current += (instantVelocity - smoothedVelocity.current) * 0.2
      lastScrollY.current = currentY
      lastTime.current = now

      const drift = -(Math.min(currentY, DRIFT_DISTANCE) / DRIFT_DISTANCE) * driftMax
      const clampedVelocity = Math.max(-SWAY_VELOCITY_REF, Math.min(SWAY_VELOCITY_REF, smoothedVelocity.current))
      const sway = -(clampedVelocity / SWAY_VELOCITY_REF) * swayMax

      targetY.set(drift + sway)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [targetY, driftMax, swayMax])

  const y = useSpring(targetY, { stiffness: 45, damping: 20, mass: 1 })

  return (
    <motion.div
      className="fixed inset-x-0 -z-10 bg-sand bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        top: '-10%',
        bottom: '-10%',
        y,
        willChange: 'transform',
      }}
      animate={reduceMotion ? undefined : { scale: [1, breatheScale, 1] }}
      transition={reduceMotion ? undefined : { duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    />
  )
}
