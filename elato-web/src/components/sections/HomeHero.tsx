import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { LogoImage } from '../brand/LogoImage'
import { heroContent } from '../../content/siteContent'
import heroBackground from '../../assets/newbg/bg.png'
import heroBackgroundMobile from '../../assets/newbg/bg-mb.png'

const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const
const EASE_LOGO = [0.19, 1, 0.22, 1] as const

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
 */
export function HomeHero() {
  const reduceMotion = useReducedMotion()

  const contentStagger: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.95,
        delayChildren: reduceMotion ? 0 : 0.3,
      },
    },
  }

  const logoReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 34, scale: reduceMotion ? 1 : 0.92 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: reduceMotion ? 0.4 : 1.4, ease: EASE_LOGO },
    },
  }

  const textReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.4 : 0.8, ease: EASE_CINEMATIC },
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

      <motion.div
        initial="hidden"
        animate="visible"
        variants={contentStagger}
        className="container-elato relative flex flex-col items-center gap-6 pt-20 text-center [@media(max-height:500px)]:gap-4 [@media(max-height:500px)]:pt-10 sm:gap-7 md:gap-8 lg:gap-10"
      >
        <motion.div variants={logoReveal}>
          <LogoImage className="h-20 sm:h-28 md:h-36 lg:h-48 xl:h-56 [@media(max-height:500px)]:h-16" />
        </motion.div>

        <motion.div variants={textReveal} className="flex flex-col items-center gap-3 sm:gap-4">
          <h1 className="max-w-lg font-display text-[22px] font-normal italic leading-[1.2] text-secondary-900 sm:text-[26px] md:text-[30px] lg:text-[36px] xl:text-[40px]">
            {heroContent.headline}
          </h1>
          <p className="text-[11px] uppercase tracking-[0.32em] text-ink-soft sm:text-[12px] md:text-[13px] lg:text-[14px]">
            {heroContent.subStatement}
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}
