import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { HeroBackground } from '../brand/HeroBackground'
import { stayHero } from '../../content/stayContent'
import { heroLoadIn, staggerContainer } from '../../lib/motion'

export function StayHero() {
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 45, damping: 22, mass: 0.6 })

  const exitOpacity = useTransform(smoothProgress, [0, 0.5], reduceMotion ? [1, 1] : [1, 0])
  const exitScale = useTransform(smoothProgress, [0, 0.5], reduceMotion ? [1, 1] : [1, 0.95])
  const exitY = useTransform(smoothProgress, [0, 0.5], reduceMotion ? [0, 0] : [0, -32])

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden bg-sand pt-20"
    >
      <HeroBackground targetRef={ref} />
      <motion.div
        style={{ opacity: exitOpacity, scale: exitScale, y: exitY }}
        className="container-elato relative flex flex-col items-center justify-center gap-8 py-16 text-center"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center gap-8"
        >
          <motion.h1 variants={heroLoadIn} className="flex flex-col items-center gap-2">
            <span className="font-display text-6xl font-semibold uppercase tracking-[0.08em] text-secondary-500 lg:text-8xl">
              {stayHero.wordmarkLine1}
            </span>
            <span className="text-caption text-neutral-warm-500 lg:text-base">
              {stayHero.wordmarkLine2}
            </span>
          </motion.h1>
          <motion.p variants={heroLoadIn} className="text-body-lg max-w-md text-secondary-900">
            {stayHero.statement}
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  )
}
