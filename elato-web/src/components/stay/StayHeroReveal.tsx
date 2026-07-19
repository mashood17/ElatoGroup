import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { StayHero } from './StayHero'
import { StayIntroduction } from './StayIntroduction'

/**
 * Hero → StayIntroduction transition — mirrors Home's HeroServicesReveal
 * (src/components/sections/HeroServicesReveal.tsx) exactly, swapped to this
 * page's Hero and first section, so the pinned-hero scroll handoff feels
 * identical across the site. See that file for the full rationale.
 */
export function StayHeroReveal() {
  const reduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // See HeroServicesReveal.tsx for why these three ranges were narrowed —
  // same reasoning, kept identical across all four hero-reveal files so the
  // pin behavior still feels uniform site-wide.
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.94])
  const heroRotate = useTransform(scrollYProgress, [0, 1], [0, -5])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -35])

  if (reduceMotion) {
    return (
      <>
        <StayHero />
        <StayIntroduction />
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
            <StayHero />
          </motion.div>
        </div>
      </div>
      <StayIntroduction />
    </>
  )
}
