import { useCallback, useEffect, useState } from 'react'
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
const SWIPE_DISTANCE_PX = 70
const SWIPE_VELOCITY = 400

type LoadState = 'loading' | 'ready' | 'fallback'

function GoogleLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.12-1.43.34-2.09V7.06H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.85Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.66 2.85C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

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
      whileHover={disabled ? undefined : { y: -3, scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 340, damping: 22 }}
      className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#9E7641]/25 bg-white/[0.05] text-[#9E7641] shadow-[0_10px_28px_-14px_rgba(43,33,22,0.4)] backdrop-blur-xl transition-colors duration-300 ease-out hover:border-[#9E7641]/50 hover:bg-[#E7CAA0]/15 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9E7641]/50 md:h-12 md:w-12"
      aria-label={direction === 'prev' ? 'Previous review' : 'Next review'}
    >
      <Icon
        className={cn(
          'h-4 w-4 transition-transform duration-300 ease-out',
          direction === 'prev' ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5',
        )}
        aria-hidden="true"
      />
    </motion.button>
  )
}

export function ReviewsSection() {
  const reduceMotion = useReducedMotion()
  const [state, setState] = useState<LoadState>('loading')
  const [liveReviews, setLiveReviews] = useState<TestimonialItem[]>([])
  const [index, setIndex] = useState(0)
  const exitFade = useSectionExitFade<HTMLElement>()

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

  const triggerNav = useCallback(
    (direction: 1 | -1) => {
      setIndex((i) => (i + direction + count) % count)
    },
    [count],
  )

  const goToIndex = useCallback((i: number) => {
    setIndex(i)
  }, [])

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

  const staggerParent: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.12, delayChildren: reduceMotion ? 0 : 0.05 } },
  }

  const introReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_EDITORIAL } },
  }

  // Previous review fades/blurs/scales down as it leaves; the next one
  // rises in with blur resolving to sharp focus. `staggerChildren` on the
  // "center" transition cascades into each of TestimonialCard's own
  // elements (quote icon → text → rating → identity), which inherit this
  // variant since they define no initial/animate of their own.
  const reviewVariants: Variants = {
    enter: {
      opacity: 0,
      y: reduceMotion ? 0 : 16,
      scale: reduceMotion ? 1 : 0.97,
      filter: reduceMotion ? 'blur(0px)' : 'blur(10px)',
    },
    center: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        stiffness: 220,
        damping: 26,
        mass: 0.7,
        staggerChildren: reduceMotion ? 0 : 0.09,
        delayChildren: reduceMotion ? 0 : 0.06,
      },
    },
    exit: {
      opacity: 0,
      y: reduceMotion ? 0 : -12,
      scale: reduceMotion ? 1 : 0.97,
      filter: reduceMotion ? 'blur(0px)' : 'blur(8px)',
      transition: { duration: 0.32, ease: EASE_EDITORIAL },
    },
  }

  return (
    <motion.section
      id="reviews"
      ref={exitFade.ref}
      style={exitFade.style}
      className="relative py-20 font-sans lg:py-32"
    >
      <SectionBackground image={sectionBackground} mobileImage={sectionBackgroundMobile} />

      <div className="container-elato">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerParent}
          className="mx-auto flex max-w-xl flex-col items-center text-center lg:max-w-2xl"
        >
          <motion.div variants={introReveal}>
            <p className="text-caption text-[#9E7641]">{reviewsHeading.overline}</p>
            <h2 className="mt-4 font-sans text-[32px] font-bold leading-[1.15] text-[#9E7641] sm:text-[40px]">
              {reviewsHeading.title}
            </h2>
            <span className="mx-auto mt-5 block h-px w-10 bg-[#E7CAA0]" aria-hidden="true" />
          </motion.div>

          {state === 'loading' ? (
            <motion.div variants={introReveal} className="mt-10 w-full">
              <SkeletonCard className="h-56 w-full max-w-lg rounded-2xl mx-auto" />
            </motion.div>
          ) : (
            <motion.div variants={introReveal} className="relative mt-10 w-full lg:mt-16">
              {/* Oversized decorative quotation mark — pure ambient depth,
                  same serif-italic family as the quote text, sitting far
                  behind it at very low opacity. Persists across review
                  changes rather than remounting inside the crossfade. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 select-none font-serif-italic text-[130px] italic leading-none text-[#9E7641]/[0.08] sm:-top-9 sm:text-[180px] lg:-top-11 lg:text-[215px]"
              >
                &ldquo;
              </span>

              <div
                tabIndex={0}
                onKeyDown={handleKeyDown}
                role="group"
                aria-roledescription="carousel"
                aria-label="Guest reviews"
                className="relative w-full outline-none"
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
                  <div className="mt-8 flex items-center justify-center gap-6">
                    <NavArrow direction="prev" onClick={() => triggerNav(-1)} />

                    <div className="flex items-center gap-2">
                      {items.map((item, i) => (
                        <motion.button
                          key={item.id}
                          type="button"
                          onClick={() => goToIndex(i)}
                          aria-label={`Go to review ${i + 1} of ${count}`}
                          aria-current={i === index}
                          className="h-1.5 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#9E7641]/50"
                          animate={{
                            width: i === index ? 28 : 6,
                            backgroundColor: i === index ? '#9E7641' : 'rgba(158,118,65,0.25)',
                          }}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      ))}
                    </div>

                    <NavArrow direction="next" onClick={() => triggerNav(1)} />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <motion.div
            variants={introReveal}
            className="mt-12 flex w-full max-w-sm flex-col gap-3.5 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center lg:mt-14"
          >
            <motion.a
              href={businessInfo.googleReviewsUrl}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -3, boxShadow: '0 14px 30px -12px rgba(158,118,65,0.4)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#9E7641]/40 px-7 py-3.5 text-caption text-[#9E7641] transition-colors duration-300 hover:bg-[#E7CAA0]/10"
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
              whileHover={{ y: -3, boxShadow: '0 16px 34px -12px rgba(140,104,54,0.5)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#B78A4C] to-[#8C6836] px-7 py-3.5 text-caption text-white shadow-[0_8px_20px_-8px_rgba(140,104,54,0.5)] transition-colors duration-300 hover:from-[#C39A5C] hover:to-[#96713C]"
            >
              Write a Review
              <PenLine
                className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:-rotate-6"
                aria-hidden="true"
              />
            </motion.a>
          </motion.div>

          <motion.p variants={introReveal} className="mt-5 flex items-center gap-1.5 text-xs text-neutral-warm-500">
            Verified reviews on Google
            <GoogleLogo className="h-3.5 w-3.5 shrink-0" />
          </motion.p>
        </motion.div>
      </div>
    </motion.section>
  )
}
