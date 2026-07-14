import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { HeroBackground } from '../brand/HeroBackground'
import { LogoImage } from '../brand/LogoImage'
import { heroContent } from '../../content/siteContent'
import { heroLoadIn, staggerContainer } from '../../lib/motion'

/**
 * The hero is deliberately minimal — logo, headline, subheading, nothing
 * else — so whitespace does the work instead of a card or CTA competing
 * for attention (client direction: "let whitespace create the luxury").
 *
 * On top of the existing mount-in stagger, the whole content block also
 * fades/scales/lifts out as the user scrolls through the hero's own height
 * (spring-smoothed for a cinematic, not mechanical, feel), so the page
 * never cuts straight from hero to the next section. This is layered on a
 * separate wrapping element rather than merged into the entrance variants,
 * since both would otherwise fight over the same `opacity`/`y` properties.
 */
export function Hero() {
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
      id="home"
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden bg-sand pt-20"
    >
      <HeroBackground targetRef={ref} />
      <motion.div
        style={{ opacity: exitOpacity, scale: exitScale, y: exitY }}
        className="container-elato relative flex flex-col items-center justify-center gap-8 py-16 text-center lg:gap-10"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center gap-8 lg:gap-10"
        >
          <motion.div variants={heroLoadIn}>
            <LogoImage className="h-16 sm:h-20 md:h-24 lg:h-32" />
          </motion.div>
          <motion.h1
            variants={heroLoadIn}
            className="text-display-1 max-w-3xl text-secondary-900"
          >
            {heroContent.headline}
          </motion.h1>
          <motion.p variants={heroLoadIn} className="text-body-lg max-w-xl text-secondary-900">
            {heroContent.subStatement}
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  )
}
