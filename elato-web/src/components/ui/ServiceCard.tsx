import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from 'framer-motion'
import { memo, useRef } from 'react'
import { cn } from '../../lib/cn'
import { usePageTransition } from '../../lib/pageTransition'
import { useInView } from '../../lib/useInView'

const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const

// Entrance pacing: each card gets real time to rise and settle before the
// next one begins, rather than all three arriving in a quick, mechanical
// burst. Stagger (time between cards *starting*) is well under the full
// duration, so the cascade still overlaps slightly at the edges — enough
// for a card to visibly be finishing its settle as the next begins rising,
// which reads as a deliberate, breathing sequence rather than either a
// simultaneous pop or three fully isolated, dead-air-separated beats.
const CARD_ENTRANCE_DURATION = 1.15
const CARD_ENTRANCE_STAGGER = 0.55
const CARD_TITLE_DELAY_OFFSET = 0.5

const MotionLink = motion.create(Link)

/**
 * Editorial carousel card (Rolex-style interaction, ELATŌ's own visuals) —
 * image + title only, sized as a carousel item rather than a grid cell. A
 * plain (non-motion) outer wrapper owns the static sizing (one shared card
 * size per breakpoint — all three desktop cards identical) so it never
 * fights the inner `motion.div`'s own transform-driven entrance animation —
 * two nested elements each animating their own `transform` compose cleanly;
 * one element doing both would have the later inline style silently clobber
 * the earlier one.
 *
 * Framing is deliberately split by breakpoint: mobile is a tall, restrained
 * portrait panel — one hairline border, one soft shadow, no gold-gradient
 * frame, no conic glow, no glass sheen — so the photograph itself (kept at
 * its original brightness/color, just a small bottom-localized gradient for
 * title legibility) stays the dominant visual. Desktop keeps the original
 * ornate three-layer frame (gold-gradient border ring + slow conic sweep +
 * glass reflection) entirely unchanged behind `lg:` classes.
 *
 * Entrance rises from below (opacity + blur + scale settle), staggered by
 * `index` at a deliberately unhurried pace (see CARD_ENTRANCE_* above) so
 * each card is felt arriving individually rather than all three popping in
 * together, and fires off the section-level `entered` signal — every card
 * plays automatically the moment Services becomes the active scene, whether
 * or not it's individually on screen yet, and swiping the strip afterwards
 * never replays it.
 */
interface ServiceCardProps {
  title: string
  imageSrc: string
  href: string
  index: number
  /**
   * Section-driven entrance signal (from Services' useSceneEntrance): all
   * three cards receive it simultaneously, so the staggered rise plays for
   * every card the moment the scene becomes active — a card doesn't need to
   * be individually visible (mobile cards 2/3 start off-screen in the
   * horizontal strip), and swiping can never trigger or replay it.
   */
  entered: boolean
  className?: string
}

export const ServiceCard = memo(function ServiceCard({ title, imageSrc, href, index, entered, className }: ServiceCardProps) {
  const reduceMotion = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const { isTransitioning, pendingId, beginCardTransition } = usePageTransition()
  // Same "pause continuous GPU work once scrolled off-screen" pattern the
  // hero backgrounds already use (see useInView.ts) — applied to both the
  // permanent conic-gradient border glow and the glass reflection sheen.
  const { ref: glowInViewRef, inView: glowInView } = useInView<HTMLDivElement>()

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

  const cardReveal: Variants = {
    hidden: reduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 44, scale: 0.96, filter: 'blur(3px)' },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: reduceMotion ? 0.3 : CARD_ENTRANCE_DURATION,
        ease: EASE_CINEMATIC,
        delay: reduceMotion ? 0 : index * CARD_ENTRANCE_STAGGER,
      },
    },
  }

  const titleTransition = {
    duration: reduceMotion ? 0.2 : 0.7,
    ease: EASE_CINEMATIC,
    delay: reduceMotion ? 0 : index * CARD_ENTRANCE_STAGGER + CARD_TITLE_DELAY_OFFSET,
  }

  return (
    // Static sizing layer — one shared card size on each breakpoint (all
    // three desktop cards identical: same width/height/radius, no scaling,
    // no dimming). Also owns carousel sizing/snap (mobile) so the flex row's
    // own layout math never touches the motion.div below.
    <div
      className={cn(
        'shrink-0 snap-center',
        // Mobile: editorial panel, ~78vw so the neighbour peeks at the
        // right edge (Rolex-style). Desktop: all three cards share one
        // viewport-derived size matched to the Rolex reference — height
        // leads (~78% of the visible viewport), width follows via a tall
        // 5:8 editorial aspect ratio (~27vw at a 16:9 viewport, so the
        // triptych spans ~84vw), with a vw cap so three cards + gaps
        // always fit on narrower desktops (the height stays fixed if the
        // cap bites, so all cards remain identical either way).
        'w-[78vw] max-w-[360px]',
        'lg:aspect-[2/3] lg:h-[88dvh] lg:max-h-[1020px] lg:w-auto lg:max-w-[30vw]',
        className,
      )}
    >
      <motion.div
        ref={(node) => {
          cardRef.current = node
          glowInViewRef.current = node
        }}
        initial="hidden"
        animate={entered ? 'visible' : 'hidden'}
        variants={cardReveal}
        className="group h-full"
      >
        <MotionLink
          ref={linkRef}
          to={href}
          onClick={handleClick}
          whileHover={reduceMotion || isTransitioning ? undefined : { y: -8, scale: 1.015 }}
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
              ? { boxShadow: '0 0 26px rgba(231,202,160,0.5), 0 18px 18px -8px rgba(0,0,0,0.5), 0 60px 48px -20px rgba(0,0,0,0.65)' }
              : undefined
          }
          transition={{ duration: 0.5, ease: EASE_CINEMATIC }}
          aria-disabled={isTransitioning || undefined}
          className={cn(
            // Mobile: tall portrait panel, restrained radius, a single thin
            // hairline border, one soft ambient shadow — no gold-gradient
            // frame, no glow, no double-shadow stack. Desktop (lg:) is the
            // original ornate frame, untouched.
            'relative block h-[64dvh] max-h-[600px] w-full overflow-hidden rounded-[22px] border border-[#E7CAA0]/18 p-0 shadow-[0_10px_28px_-12px_rgba(0,0,0,0.55)] transition-shadow duration-700 ease-out',
            'lg:h-full lg:max-h-none lg:rounded-[34px] lg:border-2 lg:border-[#E7CAA0]/45 lg:p-[1.5px] lg:shadow-[0_0_14px_rgba(231,202,160,0.22),0_18px_18px_-10px_rgba(0,0,0,0.5),0_46px_40px_-24px_rgba(0,0,0,0.65)] lg:transition-shadow lg:duration-700 lg:ease-out lg:group-hover:shadow-[0_0_24px_rgba(231,202,160,0.45),0_24px_24px_-10px_rgba(0,0,0,0.55),0_56px_48px_-20px_rgba(0,0,0,0.7)]',
            isTransitioning && 'pointer-events-none',
          )}
        >
          {/* Layer 1 — permanent four-stop gold gradient border, always visible at rest. Desktop-only — the mobile card uses a single plain hairline border instead (restrained framing per the mobile editorial brief). */}
          <div
            className="pointer-events-none absolute inset-0 hidden rounded-[34px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] lg:block"
            style={{
              background: 'linear-gradient(135deg, #E7CAA0 0%, rgba(231,202,160,0.85) 35%, rgba(255,245,220,0.5) 68%, #C79A4B 100%)',
            }}
            aria-hidden="true"
          />
          {/* Layer 1b — the slow metallic light sweeping across that border. Desktop-only. */}
          <div className="absolute inset-0 hidden overflow-hidden rounded-[34px] lg:block" aria-hidden="true">
            <div className="card-border-glow" style={{ animationPlayState: glowInView ? 'running' : 'paused' }} />
          </div>

          {/* Layer 2 — inner dark card the image sits inside, not on top of the page */}
          <div className="relative z-10 h-full w-full overflow-hidden rounded-[20px] bg-[#110C08] font-sans shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_0_36px_rgba(8,5,3,0.55)] lg:rounded-[32px]">
            {/* Layer 3 — the photograph. A real <img> (not a CSS background-image)
                so the browser can apply native lazy-loading. */}
            {imageSrc && (
              <motion.img
                src={imageSrc}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center"
                style={{ y: imageY, willChange: 'transform' }}
                animate={reduceMotion ? undefined : { scale: isSelected ? 1.2 : 1.14 }}
                whileHover={reduceMotion || isTransitioning ? undefined : { scale: 1.19 }}
                whileTap={reduceMotion || isTransitioning ? undefined : { scale: 1.17 }}
                transition={{ duration: 0.8, ease: EASE_CINEMATIC }}
                aria-hidden="true"
              />
            )}

            {/* Layer 3b — glass reflection sweep, slow and mostly idle. Desktop-only — kept off the mobile card along with the gold frame (restrained framing brief). */}
            <div className="pointer-events-none absolute inset-0 hidden overflow-hidden rounded-[32px] lg:block" aria-hidden="true">
              <div className="card-glass-sheen" style={{ animationPlayState: glowInView ? 'running' : 'paused' }} />
            </div>

            {/* Layer 4 — a single, small, bottom-localized gradient purely for
                title legibility. The photograph itself is otherwise untouched
                — no filter, no full-card overlay, no opacity dimming. Sized
                to the bottom ~40% of the card only, nearly transparent until
                the last stretch right behind the text. */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/60 via-black/15 to-transparent"
              aria-hidden="true"
            />

            {/* Content — title only, above image/vignette layers via DOM order
                plus an explicit z-20. Driven directly off the same section
                `entered` signal as the card (its own delay from `index`) —
                the MotionLink above carries an explicit `animate` prop, which
                stops variant propagation, so the title can't inherit the
                card's variant state and must be driven explicitly. */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-6 pb-8 text-center transition-transform duration-500 ease-out group-hover:-translate-y-1.5 lg:p-8 lg:pb-10">
              <motion.h3
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={
                  entered
                    ? { opacity: 1, y: 0 }
                    : reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: 14 }
                }
                transition={titleTransition}
                // Rolex-reference title treatment on every breakpoint —
                // centered, bold sans (the reference's Helvetica-style
                // weight), tight tracking, sitting near the card's bottom
                // edge.
                className="font-sans text-[26px] font-bold leading-tight tracking-tight text-[#F1E4CC]"
              >
                {title}
              </motion.h3>
              <span
                aria-hidden="true"
                className="mx-auto mt-3 block h-px w-10 bg-[#E7CAA0]/55 transition-all duration-500 ease-out group-hover:w-16 group-hover:bg-[#E7CAA0]/85"
              />
            </div>
          </div>
        </MotionLink>
      </motion.div>
    </div>
  )
})
