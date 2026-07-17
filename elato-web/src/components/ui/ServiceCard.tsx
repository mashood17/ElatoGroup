import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '../../lib/cn'

const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const

/**
 * Fixed-height image card (not aspect-ratio-driven — that made cards balloon
 * on wide columns) with the title/description/CTA sitting on a contained
 * dark scrim at the bottom. Thin brand-gold border + inset hairline
 * highlight + soft ambient shadow read as an editorial print/hospitality
 * card rather than app UI — no blur/glassmorphism.
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
 * `useScroll` against this card's box) layered under the existing hover
 * zoom — two independent effects on the same transform, composed by
 * Framer Motion rather than colliding, so the image feels alive while
 * idle and zooms further on hover/focus.
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
      <Link
        to={href}
        className="relative block h-[380px] w-full overflow-hidden rounded-[20px] border border-[#E7CAA0]/40 font-sans shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_18px_40px_-18px_rgba(58,46,30,0.45)] transition-[box-shadow,border-color,transform] duration-500 ease-out hover:-translate-y-1.5 hover:border-[#E7CAA0]/80 hover:shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_26px_54px_-16px_rgba(58,46,30,0.5)] sm:h-[420px] lg:h-[460px]"
      >
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageSrc})`, y: imageY, scale: 1.14 }}
          whileHover={reduceMotion ? undefined : { scale: 1.24 }}
          transition={{ duration: 0.8, ease: EASE_CINEMATIC }}
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-ink/10"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-inset ring-white/10" aria-hidden="true" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col p-6 pt-16 lg:p-8 lg:pt-20">
          <motion.h3 variants={contentItem} className="text-2xl font-semibold leading-tight text-[#E7CAA0] lg:text-3xl">
            {title}
          </motion.h3>
          <motion.p variants={contentItem} className="text-body mt-2 max-w-[30ch] text-[#E7CAA0]/85">
            {description}
          </motion.p>

          <motion.span variants={contentItem} className="text-caption mt-6 inline-flex w-fit items-center gap-2 text-[#E7CAA0]">
            <span className="relative inline-block pb-0.5">
              Explore
              <span className="absolute inset-x-0 -bottom-px h-px origin-left bg-[#E7CAA0]/50 transition-transform duration-500 ease-out group-hover:scale-x-0" />
              <span className="absolute inset-x-0 -bottom-px h-px origin-right scale-x-0 bg-[#E7CAA0] transition-transform duration-500 ease-out group-hover:scale-x-100" />
            </span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
          </motion.span>
        </div>
      </Link>
    </motion.div>
  )
}
