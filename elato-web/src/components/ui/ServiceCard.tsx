import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from 'framer-motion'
import { memo, useRef } from 'react'
import { cn } from '../../lib/cn'
import { usePageTransition } from '../../lib/pageTransition'

const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const

const MotionLink = motion.create(Link)

/**
 * Fixed-height image card (not aspect-ratio-driven — that made cards balloon
 * on wide columns), built as a true three-layer frame rather than an image
 * with rounded corners:
 *
 *   1. Outer luxury border — a permanent 2px ring painted with a four-stop
 *      gold gradient (`#E7CAA0` → `rgba(231,202,160,.9)` →
 *      `rgba(255,245,220,.6)` → `#C79A4B`), always visible at rest — not a
 *      solid CSS `border`, which is why it's a separate absolutely
 *      positioned layer rather than a `border-*` utility.
 *   2. A slow conic-gradient "light" (`.card-border-glow`, index.css)
 *      sweeps across that gradient every 9s, `overlay`-blended so it reads
 *      as a moving metallic highlight ~15-20% brighter than the gradient
 *      beneath it, not a separate colored wedge.
 *   3. Inner dark card — a near-black warm base (`bg-[#140E09]`) that the
 *      image sits on, so the frame never looks like bare photography with
 *      rounded corners; its own inset highlight + inset vignette make the
 *      image read as set *into* the frame.
 *
 * The whole assembly (border + card + image) is one `MotionLink`, so the
 * entire framed card lifts/glows as a single floating unit on hover/tap
 * rather than the image moving independently inside a static frame.
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
 * where they're in view at once.
 *
 * Title/description/Explore each carry their *own* `initial`/`whileInView`
 * (own stagger delay computed from `index`) rather than inheriting a
 * "visible" variant propagated down from the card's root — `MotionLink`
 * sits between the root and this content with its own `whileHover`/
 * `whileTap` and no `variants`, which is exactly the kind of intermediate
 * motion node that can silently stop ambient variant propagation to
 * everything nested inside it. Self-driving each element removes that
 * dependency entirely: they animate in (and reliably land on `opacity: 1`)
 * regardless of what any ancestor motion component is doing.
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

export const ServiceCard = memo(function ServiceCard({ title, description, imageSrc, href, index, className }: ServiceCardProps) {
  const reduceMotion = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const { isTransitioning, pendingId, beginCardTransition } = usePageTransition()

  const isSelected = pendingId === href
  const isDimmed = isTransitioning && !isSelected

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (reduceMotion) return // plain <Link> navigation, no shared-element cinematic
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return // let modified/middle clicks open in a new tab as normal

    event.preventDefault()
    if (isTransitioning || !linkRef.current) return

    const rect = linkRef.current.getBoundingClientRect()
    beginCardTransition({
      id: href,
      href,
      imageSrc,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
    })
  }

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
      },
    },
  }

  // Base delay each content line waits before its own whileInView starts —
  // after the card itself has mostly settled in, so text doesn't fly in
  // before the frame around it has arrived.
  const contentBaseDelay = reduceMotion ? 0 : index * 0.15 + 0.3
  const contentTransition = (step: number) => ({
    duration: reduceMotion ? 0.2 : 0.55,
    ease: EASE_CINEMATIC,
    delay: reduceMotion ? 0 : contentBaseDelay + step * 0.12,
  })

  return (
    <motion.div
      ref={cardRef}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={cardReveal}
      className={cn('group h-full', className)}
    >
      <MotionLink
        ref={linkRef}
        to={href}
        onClick={handleClick}
        whileHover={reduceMotion || isTransitioning ? undefined : { y: -6, scale: 1.012 }}
        whileTap={reduceMotion || isTransitioning ? undefined : { scale: 0.99 }}
        animate={
          reduceMotion
            ? undefined
            : isSelected
              ? { scale: 1.02, y: -10, opacity: 1 }
              : isDimmed
                ? { opacity: 0.18, scale: 0.965, y: 0 }
                : { opacity: 1, scale: 1, y: 0 }
        }
        // Plain (non-motion-animated) style so it rides the element's existing
        // `transition-shadow duration-700` CSS transition instead of fighting
        // framer-motion's own inline-style ownership of animated properties —
        // undefined lets the CSS shadow classes (rest / group-hover) show through.
        style={
          isSelected
            ? { boxShadow: '0 0 46px rgba(231,202,160,0.55), 0 16px 30px -8px rgba(58,46,30,0.4), 0 55px 90px -20px rgba(58,46,30,0.6)' }
            : undefined
        }
        transition={{ duration: 0.5, ease: EASE_CINEMATIC }}
        aria-disabled={isTransitioning || undefined}
        className={cn(
          'relative block h-[380px] w-full rounded-[30px] p-[2px] shadow-[0_0_20px_rgba(231,202,160,0.28),0_8px_20px_-6px_rgba(58,46,30,0.35),0_40px_70px_-24px_rgba(58,46,30,0.55)] transition-shadow duration-700 ease-out group-hover:shadow-[0_0_42px_rgba(231,202,160,0.5),0_14px_28px_-8px_rgba(58,46,30,0.4),0_50px_85px_-20px_rgba(58,46,30,0.6)] sm:h-[420px] lg:h-[460px]',
          isTransitioning && 'pointer-events-none',
        )}
      >
        {/* Layer 1 — permanent four-stop gold gradient border, always visible at rest */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[30px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.55)]"
          style={{
            background: 'linear-gradient(135deg, #E7CAA0 0%, rgba(231,202,160,0.9) 35%, rgba(255,245,220,0.6) 68%, #C79A4B 100%)',
          }}
          aria-hidden="true"
        />
        {/* Layer 1b — the slow metallic light sweeping across that border */}
        <div className="absolute inset-0 overflow-hidden rounded-[30px]" aria-hidden="true">
          <div className="card-border-glow" />
        </div>

        {/* Layer 2 — inner dark card the image sits inside, not on top of the page */}
        <div className="relative z-10 h-full w-full overflow-hidden rounded-[28px] bg-[#140E09] font-sans shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_0_30px_rgba(20,14,9,0.4)]">
          {/* Layer 3 — the photograph */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageSrc})`, y: imageY, willChange: 'transform' }}
            animate={reduceMotion ? undefined : { scale: isSelected ? 1.2 : 1.14 }}
            whileHover={reduceMotion || isTransitioning ? undefined : { scale: 1.19 }}
            whileTap={reduceMotion || isTransitioning ? undefined : { scale: 1.17 }}
            transition={{ duration: 0.8, ease: EASE_CINEMATIC }}
            aria-hidden="true"
          />

          <div
            className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/50 to-transparent"
            aria-hidden="true"
          />

          {/* Content — layer 5, above the image (layer 3) and gradient
              overlay (layer 4) via DOM order plus an explicit z-20 so
              there's no ambiguity. Each line drives its own whileInView
              (see the note above `contentTransition`) so it's guaranteed to
              resolve to opacity:1 on its own, independent of any ancestor's
              variant state. The whole block nudges up and brightens
              slightly on hover/tap — layer 6, a plain CSS transition on
              `.group`, independent of the image's own Framer Motion zoom. */}
          <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col p-6 pb-7 pl-7 pr-6 pt-16 opacity-100 transition-[transform,filter] duration-500 ease-out group-hover:-translate-y-1.5 group-hover:brightness-110 lg:p-8 lg:pb-10 lg:pl-9 lg:pr-8 lg:pt-20">
            <motion.h3
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={contentTransition(0)}
              className="text-2xl font-semibold leading-tight tracking-tight text-[#E7CAA0] lg:text-3xl"
            >
              {title}
            </motion.h3>
            <motion.p
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={contentTransition(1)}
              className="text-body mt-2.5 max-w-[30ch] text-[#E7CAA0]/85"
            >
              {description}
            </motion.p>

            <motion.span
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={contentTransition(2)}
              className="text-caption mt-7 inline-flex w-fit items-center gap-2 text-[#E7CAA0]"
            >
              <span className="relative inline-block pb-0.5">
                Explore
                <span className="absolute inset-x-0 -bottom-px h-px origin-left bg-[#E7CAA0]/50 transition-transform duration-500 ease-out group-hover:scale-x-0" />
                <span className="absolute inset-x-0 -bottom-px h-px origin-right scale-x-0 bg-[#E7CAA0] transition-transform duration-500 ease-out group-hover:scale-x-100" />
              </span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
            </motion.span>
          </div>
        </div>
      </MotionLink>
    </motion.div>
  )
})
