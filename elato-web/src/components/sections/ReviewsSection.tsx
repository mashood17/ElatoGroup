import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { ArrowLeft, ArrowRight, Quote, Star } from 'lucide-react'
import { SkeletonCard } from '../ui/SkeletonCard'
import { TestimonialCard, type TestimonialItem } from '../ui/TestimonialCard'
import { SectionBackground } from '../ui/SectionBackground'
import { businessInfo } from '../../content/siteContent'
import { reviewsHeading, reviewsFallback } from '../../content/reviewsContent'
import { getFeaturedReviews } from '../../lib/reviewsRepository'
import { useAggregateRating } from '../../lib/useAggregateRating'
import { viewportOnce } from '../../lib/motion'
import sectionBackground from '../../assets/newbg/bg.jpg'

const EASE_EDITORIAL = [0.16, 1, 0.3, 1] as const
const CARD_GAP_PX = 24

type LoadState = 'loading' | 'ready' | 'fallback'

export function ReviewsSection() {
  const reduceMotion = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [liveReviews, setLiveReviews] = useState<TestimonialItem[]>([])
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)
  const aggregateRating = useAggregateRating()

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

  const updateScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setCanScrollPrev(el.scrollLeft > 8)
    setCanScrollNext(el.scrollLeft < max - 8)
    setScrollProgress(max > 0 ? el.scrollLeft / max : 0)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el || state === 'loading') return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [updateScrollState, state, items.length])

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const card = el.firstElementChild as HTMLElement | null
    const step = card ? card.getBoundingClientRect().width + CARD_GAP_PX : el.clientWidth
    el.scrollBy({ left: step * direction, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const introReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_EDITORIAL } },
  }

  const cardsContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.1, delayChildren: reduceMotion ? 0 : 0.15 } },
  }

  const cardReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_EDITORIAL } },
  }

  const fillPercent = Math.max(20, 100 / Math.max(items.length, 1))

  return (
    <section id="reviews" className="relative py-16 font-sans lg:py-24">
      <SectionBackground image={sectionBackground} />

      <div className="container-elato">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={introReveal}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-caption text-[#9E7641]">{reviewsHeading.overline}</p>
            <span className="mt-2 block h-px w-10 bg-[#E7CAA0]" aria-hidden="true" />
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#9E7641]/25 bg-[#E7CAA0]/10 px-4 py-2">
            <Star className="h-4 w-4 fill-[#9E7641] text-[#9E7641]" aria-hidden="true" />
            <span className="text-caption text-[#9E7641]">
              {aggregateRating.rating}/5 · Based on {aggregateRating.count.toLocaleString('en-IN')}+ Google reviews
            </span>
          </div>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-[320px_1fr] lg:items-start lg:gap-16">
          {/* Left column — quote-led heading + CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={introReveal}
            className="lg:sticky lg:top-32"
          >
            <Quote className="h-10 w-10 text-[#E7CAA0]" aria-hidden="true" fill="#E7CAA0" />
            <h2 className="mt-4 text-[28px] font-bold leading-tight text-[#9E7641] lg:text-[36px]">
              {reviewsHeading.title}
            </h2>
            <p className="text-body mt-3 text-neutral-warm-500">{reviewsHeading.description}</p>

            <a
              href={businessInfo.googleReviewsUrl}
              target="_blank"
              rel="noreferrer"
              className="group mt-8 hidden items-center gap-2 text-body font-semibold text-[#9E7641] lg:inline-flex"
            >
              See More Reviews on Google
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </a>
          </motion.div>

          {/* Right column — horizontally scrolling review cards, using the
              full remaining width of the row so no card is ever clipped. */}
          <div className="min-w-0">
            {state === 'loading' ? (
              <div className="flex gap-6 overflow-hidden">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} className="h-56 w-[280px] flex-none rounded-2xl sm:w-[320px]" />
                ))}
              </div>
            ) : (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={cardsContainer}
                ref={trackRef}
                className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {items.map((item) => (
                  <motion.div key={item.id} variants={cardReveal}>
                    <TestimonialCard item={item} className="w-[280px] sm:w-[320px]" />
                  </motion.div>
                ))}
              </motion.div>
            )}

            <div className="mt-6 flex items-center gap-5 lg:justify-end">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                disabled={!canScrollPrev}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#9E7641]/30 text-[#9E7641] transition-colors duration-200 ease-out hover:bg-[#E7CAA0]/20 disabled:pointer-events-none disabled:opacity-30"
                aria-label="Previous review"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div className="relative h-[3px] w-16 shrink-0 overflow-hidden rounded-full bg-[#9E7641]/15">
                <div
                  className="absolute inset-y-0 rounded-full bg-[#9E7641] transition-[left] duration-300 ease-out"
                  style={{ width: `${fillPercent}%`, left: `${scrollProgress * (100 - fillPercent)}%` }}
                />
              </div>

              <button
                type="button"
                onClick={() => scrollByCard(1)}
                disabled={!canScrollNext}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#9E7641]/30 text-[#9E7641] transition-colors duration-200 ease-out hover:bg-[#E7CAA0]/20 disabled:pointer-events-none disabled:opacity-30"
                aria-label="Next review"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile-only CTA — desktop link lives in the left column above */}
            <a
              href={businessInfo.googleReviewsUrl}
              target="_blank"
              rel="noreferrer"
              className="group mt-6 flex w-fit items-center gap-2 text-body font-semibold text-[#9E7641] lg:hidden"
            >
              See More Reviews on Google
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
