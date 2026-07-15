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
  sectionName: string
  tagline: string
  imageAlt: string
  /**
   * Production hero photograph for the floating showcase card. Optional —
   * while unset, a designed placeholder renders in its place so the layout
   * is already final. To wire in the real photo for a page, add the file
   * (see the TODO comment in that page's hero component for the exact path),
   * import it there, and pass it through as this prop — nothing else here
   * needs to change.
   */
  imageSrc?: string
  /** Small uppercase label above the floating stat badge, e.g. "Hall Capacity". */
  cardStatLabel: string
  /** The stat badge's headline value — always a real/derived figure, never invented. */
  cardStatValue: string
  /** Caption on the bottom avatar-cluster badge — kept non-numeric on purpose (no fabricated review/member counts). */
  cardBadgeLabel: string
}

/**
 * Shared Hero used by Stay / Celebré / Events — a two-column "wordmark +
 * copy" left rail against a floating photo showcase on the right, built to
 * feel like a premium hospitality brand's title card (Aman / Four Seasons
 * register) rather than the empty centered hero this replaces. The Home
 * Hero itself (`HomeHero.tsx`, `HeroLogo3D.tsx`, `LogoScene.tsx`) is
 * locked/approved and was not touched to build this — this is a separate,
 * parallel implementation, not a refactor of Home's files.
 *
 * Below `lg`, the two columns collapse into a single centered stack (logo,
 * tagline, then the image card) so the composition still reads cleanly on
 * phones/tablets.
 */
export function PremiumHero({
  id,
  logoSrc,
  logoAlt,
  logoAspect,
  macronRect,
  sectionName,
  tagline,
  imageAlt,
  imageSrc,
  cardStatLabel,
  cardStatValue,
  cardBadgeLabel,
}: PremiumHeroProps) {
  const reduceMotion = useReducedMotion()

  const taglineReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 10, filter: reduceMotion ? 'blur(0px)' : 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        delay: reduceMotion ? 0 : 2.8,
        duration: reduceMotion ? 0.4 : 0.8,
        ease: EASE_CINEMATIC,
      },
    },
  }

  const imageCardReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 28, scale: reduceMotion ? 1 : 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: reduceMotion ? 0 : 3.4,
        duration: reduceMotion ? 0.4 : 1,
        ease: EASE_CINEMATIC,
      },
    },
  }

  return (
    <section id={id} className="relative flex min-h-screen items-center overflow-hidden py-28 lg:py-24 [@media(max-height:600px)_and_(max-width:900px)]:py-16">
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

      <div className="container-elato relative grid w-full items-center gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-10 xl:gap-16">
        <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:gap-4 lg:text-left">
          <PremiumHeroLogo3D
            src={logoSrc}
            alt={logoAlt}
            aspect={logoAspect}
            macronRect={macronRect}
            className="w-[260px] sm:w-[340px] md:w-[440px] lg:w-full [@media(max-height:600px)_and_(max-width:900px)]:w-[190px]"
          />

          <motion.p
            initial="hidden"
            animate="visible"
            variants={taglineReveal}
            className="max-w-lg font-sans text-[17px] font-medium leading-relaxed tracking-[0.03em] text-[#9e7641] sm:text-[18px] md:text-[20px] lg:max-w-md lg:text-[19px] xl:text-[21px]"
          >
            {tagline}
          </motion.p>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={imageCardReveal}
          className="relative mx-auto w-full max-w-[330px] px-6 pt-8 pb-10 sm:max-w-[380px] lg:mx-0 lg:max-w-[400px] xl:max-w-[440px]"
        >
          <HeroShowcaseCard
            src={imageSrc}
            alt={imageAlt}
            sectionName={sectionName}
            reduceMotion={!!reduceMotion}
            statLabel={cardStatLabel}
            statValue={cardStatValue}
            badgeLabel={cardBadgeLabel}
          />
        </motion.div>
      </div>
    </section>
  )
}

type HeroShowcaseCardProps = {
  src?: string
  alt: string
  sectionName: string
  reduceMotion: boolean
  statLabel: string
  statValue: string
  badgeLabel: string
}

/**
 * The right-column photo showcase — a layered, floating card modeled on the
 * client-supplied reference (dot-grid accent + offset outline frame behind
 * the photo, a floating stat badge and an avatar-cluster badge overlapping
 * its corners). Restricted to the two brand tones (#e7caa0 / #9e7641) plus
 * the existing white/ink surface tokens — no other accent colors introduced.
 *
 * `src` is optional: until a real photograph is wired in via
 * `PremiumHeroProps.imageSrc`, `PlaceholderArt` renders in its place at the
 * exact same proportions, so the final layout never has to be revisited.
 */
function HeroShowcaseCard({ src, alt, sectionName, reduceMotion, statLabel, statValue, badgeLabel }: HeroShowcaseCardProps) {
  return (
    <motion.div
      className="group relative"
      animate={reduceMotion ? undefined : { y: [0, -14, 0] }}
      whileHover={reduceMotion ? undefined : { scale: 1.02 }}
      transition={
        reduceMotion
          ? undefined
          : {
              y: { delay: 4.4, duration: 7, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 0.5, ease: EASE_CINEMATIC },
            }
      }
    >
      {/* Dot-grid accent, top-right — echoes the reference's decorative corner */}
      <div aria-hidden="true" className="absolute -top-8 -right-4 z-0 grid grid-cols-6 gap-[7px] sm:-top-9 sm:-right-5">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="h-[3px] w-[3px] rounded-full bg-[#9e7641]/50" />
        ))}
      </div>

      {/* Offset outline frame, behind the photo — the reference's "picture frame" cue */}
      <div
        aria-hidden="true"
        className="absolute -top-5 -left-5 z-0 h-full w-full rounded-[1.75rem] border-2 border-[#e7caa0]"
      />

      <div className="relative z-10 aspect-[6/7] w-full overflow-hidden rounded-[1.75rem] border border-white/60 bg-surface-elevated shadow-elato-xl">
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <PlaceholderArt sectionName={sectionName} />
        )}

        {/* Inner hairline ring for a considered, finished edge */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/40" />
      </div>

      {/* Floating stat badge, top-right — overlaps the photo's corner */}
      <div className="absolute -top-5 -right-5 z-20 rounded-2xl bg-white px-4 py-3 shadow-elato-lg sm:-top-6 sm:-right-6 sm:px-5 sm:py-3.5">
        <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-ink-soft sm:text-[10px]">{statLabel}</p>
        <p className="font-display text-[20px] font-semibold leading-tight text-[#9e7641] sm:text-[24px]">{statValue}</p>
      </div>

      {/* Avatar-cluster badge, bottom-left — overlaps the photo's corner. No numeric review/member claim: the copy stays qualitative. */}
      <div className="absolute -bottom-5 -left-5 z-20 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-elato-lg sm:-bottom-6 sm:-left-6 sm:gap-3 sm:px-4 sm:py-3">
        <div className="flex -space-x-2.5" aria-hidden="true">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#e7caa0] sm:h-8 sm:w-8">
            <UserGlyph />
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#9e7641] sm:h-8 sm:w-8">
            <UserGlyph />
          </span>
        </div>
        <p className="text-[10px] font-medium leading-tight text-ink sm:text-[11px]">{badgeLabel}</p>
      </div>
    </motion.div>
  )
}

function UserGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" fill="white" fillOpacity="0.85" />
      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="white" strokeOpacity="0.85" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/**
 * TODO(production photography): this renders whenever a page's hero is
 * mounted without an `imageSrc`. See each hero component (CelebreHero.tsx /
 * StayHero.tsx / EventsHero.tsx) for the exact asset path and the import to
 * uncomment once the real photo exists — this component then simply stops
 * being reached, no structural change required.
 */
function PlaceholderArt({ sectionName }: { sectionName: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-sand-light via-sand to-tan px-8 text-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-ink-soft/70" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="9" cy="10.5" r="1.6" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3 16.5L8.5 12l3.5 3 3-2.5L21 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-caption text-ink-soft">{sectionName} photography coming soon</p>
    </div>
  )
}
