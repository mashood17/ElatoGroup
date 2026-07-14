import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState, type RefObject } from 'react'
import backgroundImage from '../../assets/backgrounds/elato-background.webp'

interface HeroBackgroundProps {
  targetRef: RefObject<HTMLElement | null>
}

/**
 * Client artwork, scoped to hero sections only (Home/Stay/Celebré/Events) —
 * everywhere else uses the plain surface tokens instead of one continuous
 * canvas. Reuses this codebase's existing per-hero `useScroll({ target })`
 * convention (already used for each hero's own image-card parallax) rather
 * than tracking whole-page scroll, so the drift is scoped to exactly one
 * hero's own scroll-through distance and stays proportionally visible
 * regardless of how long the rest of that route's page is.
 *
 * `y`/`scale` are transform-only (GPU-composited, never `background-position`).
 * The bottom fade is a static, unanimated overlay pinned to the section's
 * own bottom edge — always exactly at the seam with the next section
 * regardless of how far the image itself has drifted — so hero → content
 * never shows a hard edge.
 */
export function HeroBackground({ targetRef }: HeroBackgroundProps) {
  const reduceMotion = useReducedMotion()
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)')
    const update = () => setIsCompact(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  const driftMax = reduceMotion ? 0 : isCompact ? 18 : 36
  const breatheScale = reduceMotion ? 1 : isCompact ? 1.01 : 1.02

  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, -driftMax])

  return (
    <>
      <motion.div
        className="absolute inset-x-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          top: '-8%',
          bottom: '-8%',
          y,
          willChange: 'transform',
        }}
        animate={reduceMotion ? undefined : { scale: [1, breatheScale, 1] }}
        transition={reduceMotion ? undefined : { duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-24 lg:h-40"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--color-surface-base))' }}
        aria-hidden="true"
      />
    </>
  )
}
