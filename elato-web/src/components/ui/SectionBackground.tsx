import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { PARALLAX_MAX_PX } from '../../lib/motion'

/**
 * Full-bleed section backdrop shared by every homepage section below the
 * hero. The wrapper is exactly `inset-0` — the same size and position as
 * its own section, never extending above or below it, so it can never
 * paint over a neighbouring section. A scroll-linked parallax drift and
 * gentle scale add depth; the scale also supplies the buffer the parallax
 * needs so no edge is ever exposed, and its own overflow is contained
 * locally so nothing bleeds past the section horizontally either.
 *
 * `mobileImage` swaps the artwork below the 768px breakpoint via
 * `<picture>`, the same technique the hero itself uses — desktop keeps
 * `image` unchanged either way.
 */
export function SectionBackground({
  image,
  mobileImage,
  loading = 'lazy',
}: {
  image: string
  mobileImage?: string
  /**
   * Every current caller sits below an always-larger-than-viewport hero, so
   * `lazy` (the default) is correct site-wide — the browser starts fetching
   * well before the section scrolls into range, with no visible pop-in.
   * Left overridable to `eager` in case a future section ever sits directly
   * in the first viewport.
   */
  loading?: 'lazy' | 'eager'
}) {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [-PARALLAX_MAX_PX, PARALLAX_MAX_PX],
  )
  const scale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [1.04, 1.1])

  return (
    <div ref={ref} aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      <picture>
        {mobileImage && <source media="(min-width: 768px)" srcSet={image} />}
        <motion.img
          src={mobileImage ?? image}
          alt=""
          loading={loading}
          decoding="async"
          style={{ y: parallaxY, scale, willChange: 'transform' }}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </picture>
    </div>
  )
}
