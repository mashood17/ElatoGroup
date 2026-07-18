import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { CelebreHero } from './CelebreHero'
import { FeaturedSpecials } from './FeaturedSpecials'

/**
 * Hero → FeaturedSpecials transition — mirrors Home's HeroServicesReveal
 * (src/components/sections/HeroServicesReveal.tsx) exactly, swapped to this
 * page's Hero and first section, so the pinned-hero scroll handoff feels
 * identical across the site. See that file for the full rationale.
 */
export function CelebreHeroReveal() {
  const reduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.78])
  const heroRotate = useTransform(scrollYProgress, [0, 1], [0, -18])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80])

  if (reduceMotion) {
    return (
      <>
        <CelebreHero />
        <FeaturedSpecials />
      </>
    )
  }

  return (
    <>
      <div
        ref={containerRef}
        className="relative h-[130vh] bg-surface-base sm:h-[145vh] lg:h-[165vh]"
        style={{ perspective: '1600px' }}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.div
            style={{
              scale: heroScale,
              rotateX: heroRotate,
              y: heroY,
              transformOrigin: 'center bottom',
              willChange: 'transform',
            }}
            className="h-full w-full"
          >
            <CelebreHero />
          </motion.div>
        </div>
      </div>
      <FeaturedSpecials />
    </>
  )
}
