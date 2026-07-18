import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, type PanInfo, type Variants } from 'framer-motion'
import { ArrowLeft, ArrowRight, ExternalLink, PenLine } from 'lucide-react'
import { SkeletonCard } from '../ui/SkeletonCard'
import { TestimonialCard, type TestimonialItem } from '../ui/TestimonialCard'
import { SectionBackground } from '../ui/SectionBackground'
import { businessInfo } from '../../content/siteContent'
import { reviewsHeading, reviewsFallback } from '../../content/reviewsContent'
import { getFeaturedReviews } from '../../lib/reviewsRepository'
import { viewportOnce } from '../../lib/motion'
import { useSectionExitFade } from '../../lib/useSectionExitFade'
import { cn } from '../../lib/cn'
import sectionBackground from '../../assets/newbg/bg.jpg'
import sectionBackgroundMobile from '../../assets/newbg/bg-mb.png'

const EASE_EDITORIAL = [0.16, 1, 0.3, 1] as const
const AUTOPLAY_MS = 7000
const RESUME_AFTER_MS = 8000
const SWIPE_DISTANCE_PX = 70
const SWIPE_VELOCITY = 400

type LoadState = 'loading' | 'ready' | 'fallback'

function NavArrow({
  direction,
  onClick,
  disabled,
}: {
  direction: 'prev' | 'next'
  onClick: () => void
  disabled?: boolean
}) {
  const Icon = direction === 'prev' ? ArrowLeft : ArrowRight
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2, boxShadow: '0 10px 22px -10px rgba(158,118,65,0.45)' }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#9E7641]/30 text-[#9E7641] transition-colors duration-200 ease-out hover:bg-[#E7CAA0]/20 disabled:pointer-events-none disabled:opacity-30"
      aria-label={direction === 'prev' ? 'Previous review' : 'Next review'}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </motion.button>
  )
}

export function ReviewsSection() {
  const reduceMotion = useReducedMotion()
  const [state, setState] = useState<LoadState>('loading')
  const [liveReviews, setLiveReviews] = useState<TestimonialItem[]>([])
  const [index, setIndex] = useState(0)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [interactionPaused, setInteractionPaused] = useState(false)
  const exitFade = useSectionExitFade<HTMLElement>()
  const resumeTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    getFeaturedReviews()
      .then((rows) => {
        if (cancelled) return
        const mapped: TestimonialItem[] = rows.map((r) => ({
          id: r.id,
          author: r.author,
          rating: r.rating,
          text: r.text,
        }))
        setLiveReviews(mapped)
        setState(mapped.length > 0 ? 'ready' : 'fallback')
      })
      .catch(() => {
        if (!cancelled) setState('fallback')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Backend-driven once the Google Places sync has real featured reviews;
  // otherwise fall back to the same real Google reviews shown as premium
  // cards, so the layout never looks broken or empty.
  const items = state === 'ready' ? liveReviews : reviewsFallback
  const count = items.length
  const current = items[index] ?? items[0]

  useEffect(() => {
    setIndex(0)
  }, [state])

  useEffect(() => () => window.clearTimeout(resumeTimer.current), [])

  const pauseInteraction = useCallback(() => {
    setInteractionPaused(true)
    window.clearTimeout(resumeTimer.current)
    resumeTimer.current = window.setTimeout(() => setInteractionPaused(false), RESUME_AFTER_MS)
  }, [])

  const triggerNav = useCallback(
    (direction: 1 | -1) => {
      setIndex((i) => (i + direction + count) % count)
      pauseInteraction()
    },
    [count, pauseInteraction],
  )

  const goToIndex = useCallback(
    (i: number) => {
      setIndex(i)
      pauseInteraction()
    },
    [pauseInteraction],
  )

  // Autoplay — paused on hover/focus and for a cooldown after any manual
  // interaction (arrow, dot, swipe, or keyboard), and skipped entirely under
  // prefers-reduced-motion.
  useEffect(() => {
    if (reduceMotion || state === 'loading' || count <= 1 || hoverPaused || interactionPaused) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [reduceMotion, state, count, hoverPaused, interactionPaused])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (count <= 1) return
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      triggerNav(-1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      triggerNav(1)
    }
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (count <= 1) return
    if (info.offset.x < -SWIPE_DISTANCE_PX || info.velocity.x < -SWIPE_VELOCITY) {
      triggerNav(1)
    } else if (info.offset.x > SWIPE_DISTANCE_PX || info.velocity.x > SWIPE_VELOCITY) {
      triggerNav(-1)
    }
  }

  const introReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_EDITORIAL } },
  }

  const reviewVariants: Variants = {
    enter: { opacity: 0, y: reduceMotion ? 0 : 14, filter: reduceMotion ? 'blur(0px)' : 'blur(8px)' },
    center: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 220, damping: 26, mass: 0.7 },
    },
    exit: {
      opacity: 0,
      y: reduceMotion ? 0 : -14,
      filter: reduceMotion ? 'blur(0px)' : 'blur(8px)',
      transition: { duration: 0.3, ease: EASE_EDITORIAL },
    },
  }

  return (
    <motion.section
      id="reviews"
      ref={exitFade.ref}
      style={exitFade.style}
      className="relative py-16 font-sans lg:py-24"
    >
      <SectionBackground image={sectionBackground} mobileImage={sectionBackgroundMobile} />

      <div className="container-elato">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={viewportOnce} variants={introReveal}>
            <p className="text-caption text-[#9E7641]">{reviewsHeading.overline}</p>
            <h2 className="mt-3 font-sans text-[32px] font-bold leading-[1.15] text-[#9E7641] sm:text-[40px]">
              {reviewsHeading.title}
            </h2>
            <span className="mx-auto mt-4 block h-px w-10 bg-[#E7CAA0]" aria-hidden="true" />
          </motion.div>

          {state === 'loading' ? (
            <SkeletonCard className="mt-10 h-56 w-full max-w-lg rounded-2xl" />
          ) : (
            <div
              tabIndex={0}
              onKeyDown={handleKeyDown}
              onMouseEnter={() => setHoverPaused(true)}
              onMouseLeave={() => setHoverPaused(false)}
              onFocus={() => setHoverPaused(true)}
              onBlur={() => setHoverPaused(false)}
              role="group"
              aria-roledescription="carousel"
              aria-label="Guest reviews"
              className="mt-3 w-full outline-none"
            >
              <div className="relative touch-pan-y" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    drag={count > 1 ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.65}
                    onDragEnd={handleDragEnd}
                    variants={reviewVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className={count > 1 ? 'cursor-grab active:cursor-grabbing' : undefined}
                  >
                    <TestimonialCard item={current} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {count > 1 && (
                <div className="mt-6 flex items-center justify-center gap-5">
                  <NavArrow direction="prev" onClick={() => triggerNav(-1)} />

                  <div className="flex items-center gap-1.5">
                    {items.map((item, i) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => goToIndex(i)}
                        aria-label={`Go to review ${i + 1} of ${count}`}
                        aria-current={i === index}
                        className={cn(
                          'h-1.5 rounded-full transition-all duration-300 ease-out',
                          i === index ? 'w-6 bg-[#9E7641]' : 'w-1.5 bg-[#9E7641]/25 hover:bg-[#9E7641]/50',
                        )}
                      />
                    ))}
                  </div>

                  <NavArrow direction="next" onClick={() => triggerNav(1)} />
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center">
            <motion.a
              href={businessInfo.googleReviewsUrl}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -2, boxShadow: '0 10px 24px -10px rgba(158,118,65,0.4)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#9E7641]/40 px-6 py-3 text-caption text-[#9E7641] transition-colors duration-300 hover:bg-[#E7CAA0]/10"
            >
              See All Google Reviews
              <ExternalLink
                className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </motion.a>

            <motion.a
              href={businessInfo.googleWriteReviewUrl}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -2, boxShadow: '0 12px 28px -10px rgba(140,104,54,0.5)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#B78A4C] to-[#8C6836] px-6 py-3 text-caption text-white shadow-[0_8px_20px_-8px_rgba(140,104,54,0.5)] transition-colors duration-300 hover:from-[#C39A5C] hover:to-[#96713C]"
            >
              Write a Review
              <PenLine
                className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:-rotate-6"
                aria-hidden="true"
              />
            </motion.a>
          </div>

          <p className="mt-4 text-xs text-neutral-warm-500">Verified reviews on Google</p>
        </div>
      </div>
    </motion.section>
  )
}
