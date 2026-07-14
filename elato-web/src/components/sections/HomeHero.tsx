import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { LogoImage } from '../brand/LogoImage'
import { heroContent } from '../../content/siteContent'
import heroBackground from '../../assets/newbg/bg.png'

const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const

/**
 * Home hero, rebuilt as a single deliberate first impression: full-bleed
 * artwork, the wordmark as the dominant visual element, nothing competing
 * for attention. No CTA, no secondary visuals — client direction was
 * explicit that this screen should read as a cinematic title card (Aman /
 * Four Seasons / Apple), not a landing-page hero with a conversion element.
 *
 * Background is a plain `<img>` (not a CSS background-image) so the asset
 * renders at full quality with the browser's own decoding/priority hints,
 * and so its own entrance (a slow opacity+scale settle) can be driven by
 * Framer Motion directly rather than faked through a wrapping div.
 */
export function HomeHero() {
  const reduceMotion = useReducedMotion()

  const backgroundReveal: Variants = {
    hidden: { opacity: 0, scale: reduceMotion ? 1 : 1.05 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: reduceMotion ? 0.4 : 1.8, ease: EASE_CINEMATIC },
    },
  }

  const contentStagger: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.25,
        delayChildren: reduceMotion ? 0 : 0.45,
      },
    },
  }

  const logoReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 22, scale: reduceMotion ? 1 : 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: reduceMotion ? 0.4 : 1.2, ease: EASE_CINEMATIC },
    },
  }

  const textReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.4 : 0.9, ease: EASE_CINEMATIC },
    },
  }

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sand pt-20"
    >
      <motion.img
        src={heroBackground}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        initial="hidden"
        animate="visible"
        variants={backgroundReveal}
        className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={contentStagger}
        className="container-elato relative flex flex-col items-center gap-8 py-16 text-center lg:gap-10"
      >
        <motion.div variants={logoReveal}>
          <LogoImage className="h-14 sm:h-20 md:h-28 lg:h-36 xl:h-44" />
        </motion.div>

        <motion.div variants={textReveal} className="flex flex-col items-center gap-4 lg:gap-5">
          <h1 className="text-display-1 max-w-3xl text-secondary-900">{heroContent.headline}</h1>
          <p className="text-body-lg tracking-[0.03em] text-ink-soft">{heroContent.subStatement}</p>
        </motion.div>
      </motion.div>
    </section>
  )
}
