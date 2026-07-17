import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { HeroLogo } from '../hero/HeroLogo'
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
 * The logo owns its own cinematic entrance internally (see HeroLogo) — the
 * client-supplied SVG's baked-in multi-stage reveal (signal draw, wireframe,
 * material sweep, final static mark), starting immediately on mount. The
 * tagline and subheading below keep their original staggered reveals with
 * their own restrained delays.
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
          className="hero-bg-kenburns absolute inset-0 -z-10 h-full w-full object-cover object-center"
        />
      </picture>
      <div className="hero-bg-light" aria-hidden="true" />

      <div className="container-elato relative flex -translate-y-[8vh] flex-col items-center gap-7 pt-20 text-center [@media(max-height:500px)]:gap-3 [@media(max-height:500px)]:pt-10 sm:gap-5 md:translate-y-0 md:gap-6 lg:gap-4">
        {/*
          Width-driven, mobile-first sizing (h-auto in HeroLogo keeps the
          aspect locked). The negative vertical margins cancel the SVG's
          baked-in transparent overshoot padding (~6.4% of its width, top and
          bottom) so the visible wordmark — not the padded box — is what the
          surrounding gaps and vertical centering measure against.
        */}
        <HeroLogo className="-my-8 w-[min(104vw,33rem)] sm:-my-9 sm:w-[34rem] md:-my-11 md:w-[43rem] lg:-my-14 lg:w-[56rem] xl:-my-16 xl:w-[66rem] [@media(max-height:500px)]:-my-4 [@media(max-height:500px)]:w-[19rem]" />

        <div className="flex flex-col items-center gap-4 sm:gap-4">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={taglineReveal}
            className="max-w-lg font-sans text-[22px] font-semibold leading-snug tracking-[0.04em] text-[#B08F63] sm:text-[24px] md:text-[28px] lg:text-[32px] xl:text-[34px]"
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
