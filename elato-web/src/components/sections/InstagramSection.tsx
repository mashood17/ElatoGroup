import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { InstagramReelCard } from '../ui/InstagramReelCard'
import { SkeletonCard } from '../ui/SkeletonCard'
import { SectionBackground } from '../ui/SectionBackground'
import { instagramHeading, instagramReels as placeholderReels, type InstagramReel } from '../../content/instagramContent'
import { businessInfo } from '../../content/siteContent'
import { getLatestInstagramPosts } from '../../lib/instagramRepository'
import { cn } from '../../lib/cn'
import { viewportOnce } from '../../lib/motion'
import { useSectionExitFade } from '../../lib/useSectionExitFade'
import sectionBackground from '../../assets/newbg/bg2.png'
import sectionBackgroundMobile from '../../assets/newbg/bg-mb2.png'

const EASE_EDITORIAL = [0.16, 1, 0.3, 1] as const
const CARD_GAP_PX = 24

type LoadState = 'loading' | 'ready' | 'empty' | 'error'

/** Instagram captions have no separate title field — take the first
 * sentence/line as a short heading and let the full caption sit in the
 * description (already line-clamped by the card). */
function deriveTitle(caption: string): string {
  const firstLine = caption.split(/\r?\n|(?<=[.!?])\s/)[0]?.trim()
  if (!firstLine) return 'New on Instagram'
  return firstLine.length > 42 ? `${firstLine.slice(0, 42)}…` : firstLine
}

export function InstagramSection() {
  const reduceMotion = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const exitFade = useSectionExitFade<HTMLElement>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [state, setState] = useState<LoadState>('loading')
  const [liveReels, setLiveReels] = useState<InstagramReel[]>([])

  useEffect(() => {
    let cancelled = false
    getLatestInstagramPosts()
      .then((rows) => {
        if (cancelled) return
        const mapped: InstagramReel[] = rows.map((row) => ({
          id: row.id,
          title: deriveTitle(row.caption),
          description: row.caption || 'Tap through to see this moment on Instagram.',
          href: row.permalink,
          image: row.mediaUrl,
          isLive: true,
        }))
        setLiveReels(mapped)
        setState(mapped.length > 0 ? 'ready' : 'empty')
      })
      .catch(() => {
        if (!cancelled) setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Backend-driven when the sync has real reels cached; otherwise fall back
  // to the same premium placeholder cards so the layout never looks broken.
  const items = state === 'ready' ? liveReels : placeholderReels

  const updateScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanScrollPrev(el.scrollLeft > 8)
    setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
    const card = el.firstElementChild as HTMLElement | null
    const step = card ? card.getBoundingClientRect().width + CARD_GAP_PX : 1
    setActiveIndex(Math.round(el.scrollLeft / step))
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [updateScrollState])

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const card = el.firstElementChild as HTMLElement | null
    const step = card ? card.getBoundingClientRect().width + CARD_GAP_PX : el.clientWidth
    el.scrollBy({ left: step * direction, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const scrollToIndex = (index: number) => {
    const el = trackRef.current
    const card = el?.firstElementChild as HTMLElement | null
    if (!el || !card) return
    const step = card.getBoundingClientRect().width + CARD_GAP_PX
    el.scrollTo({ left: step * index, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const headingReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_EDITORIAL } },
  }

  const cardsContainer: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.1, delayChildren: reduceMotion ? 0 : 0.15 },
    },
  }

  const cardReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_EDITORIAL } },
  }

  return (
    <motion.section
      id="instagram"
      ref={exitFade.ref}
      style={exitFade.style}
      className="relative py-12 font-sans lg:py-24"
    >
      <SectionBackground image={sectionBackground} mobileImage={sectionBackgroundMobile} />
      <div className="container-elato">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={headingReveal}
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-xl">
            <p className="text-caption text-[#9E7641]">{instagramHeading.overline}</p>
            <span className="mt-2 block h-px w-10 bg-[#E7CAA0]" aria-hidden="true" />
            <h2 className="mt-3 text-[30px] font-bold text-[#9E7641] lg:text-[42px]">{instagramHeading.title}</h2>
            <p className="text-body mt-3 text-neutral-warm-500">{instagramHeading.description}</p>
          </div>

          <a
            href={businessInfo.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="group hidden shrink-0 items-center gap-2 text-body font-semibold text-[#9E7641] lg:inline-flex"
          >
            View on Instagram
            <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>

      {state === 'loading' ? (
        <div className="container-elato mt-8 flex gap-6 overflow-hidden lg:mt-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard
              key={i}
              className="h-[26rem] w-[82vw] max-w-[300px] flex-none rounded-3xl md:w-[46vw] md:max-w-[320px] lg:w-[320px]"
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={cardsContainer}
          className="relative mt-8 lg:mt-12"
        >
          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 pb-2 md:px-8 lg:px-[max(2rem,calc(50vw-600px))]"
          >
            {items.map((reel) => (
              <motion.div
                key={reel.id}
                variants={cardReveal}
                className="w-[82vw] max-w-[300px] flex-none snap-start md:w-[46vw] md:max-w-[320px] lg:w-[320px]"
              >
                <InstagramReelCard reel={reel} />
              </motion.div>
            ))}
          </div>

          <div className="container-elato mt-6 flex items-center justify-between lg:mt-8">
            <div className="flex gap-1.5" role="tablist" aria-label="Instagram reels">
              {items.map((reel, index) => (
                <button
                  key={reel.id}
                  type="button"
                  onClick={() => scrollToIndex(index)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300 ease-out',
                    activeIndex === index ? 'w-6 bg-[#9E7641]' : 'w-1.5 bg-[#E7CAA0]',
                  )}
                  aria-label={`Go to reel ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                disabled={!canScrollPrev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#9E7641]/30 text-[#9E7641] transition-colors duration-200 ease-out hover:bg-[#E7CAA0]/20 disabled:pointer-events-none disabled:opacity-30"
                aria-label="Previous reel"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                disabled={!canScrollNext}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#9E7641]/30 text-[#9E7641] transition-colors duration-200 ease-out hover:bg-[#E7CAA0]/20 disabled:pointer-events-none disabled:opacity-30"
                aria-label="Next reel"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile CTA — desktop link lives inline with the heading above */}
      <div className="container-elato mt-6 lg:hidden">
        <a
          href={businessInfo.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-2 text-body font-semibold text-[#9E7641]"
        >
          View on Instagram
          <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
        </a>
      </div>
    </motion.section>
  )
}
