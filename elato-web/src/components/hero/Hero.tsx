import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { HeroWordmark } from './HeroWordmark'
import { HeroVideoBackground } from './HeroVideoBackground'
import { useInView } from '../../lib/useInView'

const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const

export type HeroProps = {
  id: string
  logoSrc: string
  logoAlt: string
  logoWidth: number
  logoHeight: number
  headline: string
  /** Small uppercase line under the headline — optional, only Home currently has one. */
  subStatement?: string
  /** Extra desktop-only classes appended to the wordmark's className — e.g. a small upward shift. Mobile/tablet position is untouched. */
  logoDesktopClassName?: string
  /** Overrides the headline's default responsive text size. Used to shrink the tagline on desktop for pages whose copy is longer than Home's. */
  headlineClassName?: string
  /** Overrides the base (mobile, no breakpoint prefix) gap between the logo and the headline block below it. sm/md/lg gaps are untouched. */
  mobileGapClassName?: string
}

/**
 * The single hero shell used by every page (Home/Stay/Celebré/Events) — a
 * full-bleed cinematic title card: looping video background, the page's own
 * animated wordmark as the dominant visual element, headline + optional
 * subStatement below it. No CTA, no secondary visuals, no per-page hero
 * photograph — client direction was explicit that every page should open on
 * the same unified brand moment (Aman / Four Seasons / Apple register), with
 * the page's own content starting only below the hero.
 *
 * This was previously duplicated per page (`HomeHero` had its own copy of
 * this JSX; Stay/Celebré/Events instead rendered a two-column hero with a
 * floating photo showcase card). That divergence is gone — this is now the
 * only hero implementation, and each page's Hero wrapper (`HomeHero.tsx`,
 * `StayHero.tsx`, etc.) just supplies its own logo asset and copy.
 */
export function Hero({
  id,
  logoSrc,
  logoAlt,
  logoWidth,
  logoHeight,
  headline,
  subStatement,
  logoDesktopClassName = '',
  headlineClassName = 'max-w-lg font-sans text-[22px] font-semibold leading-snug tracking-[0.04em] text-[#B08F63] sm:text-[24px] md:text-[28px] lg:text-[32px] xl:text-[34px]',
  mobileGapClassName = 'gap-3',
}: HeroProps) {
  const reduceMotion = useReducedMotion()
  // Pauses the background video + light-drift overlay once this hero has
  // scrolled out of view — both otherwise keep running (and costing GPU/
  // battery) for the rest of the page visit, long after the user has
  // scrolled past.
  const { ref: heroSectionRef, inView: heroInView } = useInView<HTMLElement>()

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
    <section id={id} ref={heroSectionRef} className="relative flex h-screen items-center justify-center overflow-hidden">
      <HeroVideoBackground inView={heroInView} />
      <div className="hero-bg-light" aria-hidden="true" style={{ animationPlayState: heroInView ? 'running' : 'paused' }} />

      <div
        className={`container-elato relative flex -translate-y-[8vh] flex-col items-center ${mobileGapClassName} pt-20 text-center [@media(max-height:500px)]:gap-3 [@media(max-height:500px)]:pt-10 sm:gap-2 md:translate-y-0 md:gap-2 lg:gap-0`}
      >
        {/*
          Width-driven, mobile-first sizing (h-auto keeps the aspect locked).
          The negative vertical margins cancel the SVG's baked-in transparent
          overshoot padding (~6.4% of its width, top and bottom) so the
          visible wordmark — not the padded box — is what the surrounding
          gaps and vertical centering measure against.
        */}
        <HeroWordmark
          src={logoSrc}
          alt={logoAlt}
          width={logoWidth}
          height={logoHeight}
          className={`-my-[4.5rem] w-[min(156vw,49.5rem)] sm:-my-[5rem] sm:w-[51rem] md:-my-[4.5rem] md:w-[55.9rem] lg:-my-[5.8rem] lg:w-[72.8rem] xl:-my-[6.5rem] xl:w-[85.8rem] [@media(max-height:500px)]:-my-[1.5rem] [@media(max-height:500px)]:w-[28.5rem] ${logoDesktopClassName}`}
        />

        <div className="flex flex-col items-center gap-4 sm:gap-4">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={taglineReveal}
            className={headlineClassName}
          >
            {headline}
          </motion.h1>
          {subStatement && (
            <motion.p
              initial="hidden"
              animate="visible"
              variants={subheadingReveal}
              className="text-[11px] uppercase tracking-[0.32em] text-ink-soft sm:text-[12px] md:text-[13px] lg:text-[14px]"
            >
              {subStatement}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  )
}
