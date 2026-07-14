import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { PremiumHeroLogo3D } from './PremiumHeroLogo3D'
import heroBackground from '../../assets/newbg/bg.jpg'
import heroBackgroundMobile from '../../assets/newbg/bg-mb.png'

const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const

export type PremiumHeroProps = {
  id: string
  logoSrc: string
  logoAlt: string
  logoAspect: number
  macronRect: [number, number, number, number]
  tagline: string
}

/**
 * Shared Hero used by Stay / Celebré / Events — a parameterized twin of the
 * Home Hero, built to be visually and behaviorally identical to it (same
 * background approach, same layout/spacing, same logo entrance choreography,
 * same tagline reveal) per the client's explicit "identical experience,
 * different logo + text" brief. The Home Hero itself (`HomeHero.tsx`,
 * `HeroLogo3D.tsx`, `LogoScene.tsx`) is locked/approved and was not touched
 * to build this — this is a separate, parallel implementation, not a
 * refactor of Home's files.
 *
 * The Home Hero has two lines below the logo (tagline + a short caption
 * subheading); each of these three pages only has one line of provided copy,
 * so it uses the tagline's typographic treatment/timing and there is no
 * second line.
 */
export function PremiumHero({ id, logoSrc, logoAlt, logoAspect, macronRect, tagline }: PremiumHeroProps) {
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

  return (
    <section id={id} className="relative flex h-screen items-center justify-center overflow-hidden">
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
        <PremiumHeroLogo3D
          src={logoSrc}
          alt={logoAlt}
          aspect={logoAspect}
          macronRect={macronRect}
          className="h-[90px] sm:h-28 md:h-36 lg:h-48 xl:h-56 [@media(max-height:500px)]:h-16"
        />

        <motion.p
          initial="hidden"
          animate="visible"
          variants={taglineReveal}
          className="max-w-lg font-sans text-[22px] font-light leading-snug tracking-[0.04em] text-secondary-900 sm:text-[24px] md:text-[28px] lg:text-[32px] xl:text-[34px]"
        >
          {tagline}
        </motion.p>
      </div>
    </section>
  )
}
