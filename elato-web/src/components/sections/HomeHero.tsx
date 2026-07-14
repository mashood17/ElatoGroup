import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { HeroLogo3D } from '../hero/HeroLogo3D'
import { heroContent } from '../../content/siteContent'
import heroBackground from '../../assets/newbg/bg.jpg'
import heroBackgroundMobile from '../../assets/newbg/bg-mb.png'

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
 *
 * Below `md` (tablet/desktop breakpoint), a dedicated portrait-cropped
 * asset (bg-mb.png) is served via `<picture>` instead of cropping the
 * desktop artwork — the desktop `<img>` (src, object-fit, object-position)
 * is otherwise untouched. Background is locked; only the content layer below
 * is in scope.
 *
 * The logo owns its own cinematic entrance internally (see HeroLogo3D /
 * LogoScene) — a ~2.5s multi-stage reveal (body settle, macron fall +
 * landing highlight, one light sweep), starting almost immediately after
 * mount rather than after a noticeable idle pause. The tagline and
 * subheading below are timed to start only once that full sequence — plus
 * its own short pause — has resolved, each with its own restrained reveal,
 * staggered after one another.
 */
export function HomeHero() {
  const reduceMotion = useReducedMotion()

  const taglineReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 10, filter: reduceMotion ? 'blur(0px)' : 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        delay: reduceMotion ? 0 : 3.1,
        duration: reduceMotion ? 0.4 : 0.8,
        ease: EASE_CINEMATIC,
      },
    },
  }

  const subheadingReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: reduceMotion ? 0 : 3.5,
        duration: reduceMotion ? 0.4 : 0.7,
        ease: EASE_CINEMATIC,
      },
    },
  }

  return (
    <section id="home" className="relative flex h-screen items-center justify-center overflow-hidden">
      <picture>
        <source media="(min-width: 768px)" srcSet={heroBackground} />
        <img
          src={heroBackgroundMobile}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
        />
      </picture>

      <div className="container-elato relative flex -translate-y-[8vh] flex-col items-center gap-4 pt-20 text-center [@media(max-height:500px)]:gap-3 [@media(max-height:500px)]:pt-10 sm:gap-5 md:translate-y-0 md:gap-6 lg:gap-4">
        <HeroLogo3D className="h-[90px] sm:h-28 md:h-36 lg:h-48 xl:h-56 [@media(max-height:500px)]:h-16" />

        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={taglineReveal}
            className="max-w-lg font-sans text-[22px] font-light leading-snug tracking-[0.04em] text-secondary-900 sm:text-[24px] md:text-[28px] lg:text-[32px] xl:text-[34px]"
          >
            {heroContent.headline}
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={subheadingReveal}
            className="text-[11px] uppercase tracking-[0.32em] text-ink-soft sm:text-[12px] md:text-[13px] lg:text-[14px]"
          >
            {heroContent.subStatement}
          </motion.p>
        </div>
      </div>
    </section>
  )
}
