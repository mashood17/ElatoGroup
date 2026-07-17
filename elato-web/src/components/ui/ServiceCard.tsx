import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '../../lib/cn'

const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const

const MotionLink = motion.create(Link)

/**
 * Fixed-height image card (not aspect-ratio-driven — that made cards balloon
 * on wide columns). The "1px gold border" is not a literal CSS border: the
 * outer wrapper reserves a 1px ring (`p-px`) around the inner card, filled
 * by a resting translucent gold wash plus an always-on slow conic-gradient
 * sweep (`.card-border-glow`, index.css) rotating behind it — a "living"
 * ambient shimmer distinct from (and layered under) the hover-only outer
 * glow. That ring technique means the inner `<Link>` itself carries no
 * border, only the shadows that make its image feel inset/floating.
 *
 * Entrance is direction-alternating (celebre/events — even index — arrive
 * from the right, stay — odd index — from the left, matching
 * servicesContent's declared order) with an opacity+blur+scale settle, not
 * a plain fade. It's self-contained (own `whileInView`) rather than driven
 * by a shared parent stagger container — on a tall mobile single-column
 * stack, a single parent trigger fires (and finishes) before the user has
 * scrolled down to card 2/3, so they'd appear already fully visible with no
 * visible animation; each card watching its own viewport entry fixes that
 * while `index`-based delay still staggers all three together on desktop,
 * where they're in view at once. The title/description/Explore line inside
 * inherit the same "hidden"/"visible" variant keys, so `staggerChildren` on
 * the card cascades into its own internal reveal automatically.
 *
 * The background image gets a slow, scroll-linked drift (via its own
 * `useScroll` against this card's box) layered under a separate hover/tap
 * zoom — independent effects on the same transform, composed by Framer
 * Motion rather than colliding, so the image feels alive while idle and
 * zooms further on hover (desktop) or tap (touch).
 */
interface ServiceCardProps {
  title: string
  description: string
  imageSrc: string
  href: string
  index: number
  className?: string
}

export function ServiceCard({ title, description, imageSrc, href, index, className }: ServiceCardProps) {
  const reduceMotion = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({ target: cardRef, offset: ['start end', 'end start'] })
  const imageYRaw = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-16, 16])
  const imageY = useSpring(imageYRaw, { stiffness: 60, damping: 22, mass: 0.6 })

  const fromRight = index % 2 === 0

  const cardReveal: Variants = {
    hidden: reduceMotion
      ? { opacity: 0 }
      : {
          opacity: 0,
          x: fromRight ? 56 : -56,
          scale: 0.96,
          filter: 'blur(8px)',
        },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: reduceMotion ? 0.3 : 0.9,
        ease: EASE_CINEMATIC,
        delay: reduceMotion ? 0 : index * 0.15,
        staggerChildren: reduceMotion ? 0 : 0.12,
        delayChildren: reduceMotion ? 0 : index * 0.15 + 0.3,
      },
    },
  }

  const contentItem: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.2 : 0.55, ease: EASE_CINEMATIC },
    },
  }

  return (
    <motion.div
      ref={cardRef}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={cardReveal}
      className={cn('group h-full', className)}
    >
      {/* Outer ring wrapper — hosts the 1px "border" (resting gold wash +
          animated sweep) and the hover-only outer glow, both independent of
          the inner card's own shadow/scale so they never fight the same
          transform. */}
      <div className="relative h-[380px] w-full rounded-[28px] p-px shadow-[0_0_0_rgba(231,202,160,0)] transition-shadow duration-700 ease-out group-hover:shadow-[0_0_36px_rgba(231,202,160,0.4)] sm:h-[420px] lg:h-[460px]">
        <div className="absolute inset-0 overflow-hidden rounded-[28px]" aria-hidden="true">
          <div className="card-border-glow" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 rounded-[28px] bg-[#E7CAA0]/25 transition-colors duration-700 ease-out group-hover:bg-[#E7CAA0]/60"
          aria-hidden="true"
        />

        <MotionLink
          to={href}
          whileHover={reduceMotion ? undefined : { y: -6, scale: 1.012 }}
          whileTap={reduceMotion ? undefined : { scale: 0.99 }}
          transition={{ duration: 0.5, ease: EASE_CINEMATIC }}
          className="relative z-10 block h-full w-full overflow-hidden rounded-[27px] font-sans shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_0_28px_rgba(23,15,10,0.22),0_2px_10px_rgba(58,46,30,0.14),0_22px_48px_-20px_rgba(58,46,30,0.45)] transition-shadow duration-500 ease-out group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_0_28px_rgba(23,15,10,0.28),0_4px_14px_rgba(58,46,30,0.18),0_30px_60px_-18px_rgba(58,46,30,0.5)]"
        >
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageSrc})`, y: imageY, scale: 1.14 }}
            whileHover={reduceMotion ? undefined : { scale: 1.19 }}
            whileTap={reduceMotion ? undefined : { scale: 1.17 }}
            transition={{ duration: 0.8, ease: EASE_CINEMATIC }}
            aria-hidden="true"
          />

          <div
            className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-ink/10"
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute inset-0 rounded-[27px] ring-1 ring-inset ring-white/10" aria-hidden="true" />

          <div className="absolute inset-x-0 bottom-0 flex flex-col p-7 pt-16 lg:p-9 lg:pt-20">
            <motion.h3 variants={contentItem} className="text-2xl font-semibold leading-tight tracking-tight text-[#E7CAA0] lg:text-3xl">
              {title}
            </motion.h3>
            <motion.p variants={contentItem} className="text-body mt-2.5 max-w-[30ch] text-[#E7CAA0]/85">
              {description}
            </motion.p>

            <motion.span variants={contentItem} className="text-caption mt-7 inline-flex w-fit items-center gap-2 text-[#E7CAA0]">
              <span className="relative inline-block pb-0.5">
                Explore
                <span className="absolute inset-x-0 -bottom-px h-px origin-left bg-[#E7CAA0]/50 transition-transform duration-500 ease-out group-hover:scale-x-0" />
                <span className="absolute inset-x-0 -bottom-px h-px origin-right scale-x-0 bg-[#E7CAA0] transition-transform duration-500 ease-out group-hover:scale-x-100" />
              </span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
            </motion.span>
          </div>
        </MotionLink>
      </div>
    </motion.div>
  )
}
