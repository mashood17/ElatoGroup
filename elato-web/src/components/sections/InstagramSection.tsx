import { useEffect, useState } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { InstagramFanCarousel } from '../ui/InstagramFanCarousel'
import { SkeletonCard } from '../ui/SkeletonCard'
import { SectionBackground } from '../ui/SectionBackground'
import { instagramHeading, instagramReels as placeholderReels, type InstagramReel } from '../../content/instagramContent'
import { businessInfo } from '../../content/siteContent'
import { getLatestInstagramPosts } from '../../lib/instagramRepository'
import { viewportOnce } from '../../lib/motion'
import { useSectionExitFade } from '../../lib/useSectionExitFade'
import sectionBackground from '../../assets/newbg/bg2.png'
import sectionBackgroundMobile from '../../assets/newbg/bg-mb2.png'

const EASE_EDITORIAL = [0.16, 1, 0.3, 1] as const

function InstagramIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

type LoadState = 'loading' | 'ready' | 'empty' | 'error'

/** Instagram captions have no separate title field — take the first
 * sentence/line as a short heading, and the description is whatever
 * caption text remains *after* that line (not the full caption again,
 * which just repeated the title's own sentence as the first line of the
 * paragraph below it). */
function splitCaption(caption: string): { title: string; description: string } {
  const [firstLine, ...rest] = caption.split(/\r?\n|(?<=[.!?])\s/)
  const trimmedFirst = firstLine?.trim()
  if (!trimmedFirst) return { title: 'New on Instagram', description: 'Tap through to see this moment on Instagram.' }

  const title = trimmedFirst.length > 42 ? `${trimmedFirst.slice(0, 42)}…` : trimmedFirst
  const description = rest.join(' ').trim() || 'Tap through to see this moment on Instagram.'
  return { title, description }
}

export function InstagramSection() {
  const reduceMotion = useReducedMotion()
  const exitFade = useSectionExitFade<HTMLElement>()
  const [state, setState] = useState<LoadState>('loading')
  const [liveReels, setLiveReels] = useState<InstagramReel[]>([])

  useEffect(() => {
    let cancelled = false
    getLatestInstagramPosts()
      .then((rows) => {
        if (cancelled) return
        const mapped: InstagramReel[] = rows.map((row) => {
          const { title, description } = splitCaption(row.caption)
          return {
            id: row.id,
            title,
            description,
            href: row.permalink,
            image: row.mediaUrl,
            video: row.videoUrl ?? undefined,
            isLive: true,
          }
        })
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

  const headingReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_EDITORIAL } },
  }

  return (
    <motion.section
      id="instagram"
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
          variants={headingReveal}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-caption tracking-[0.2em] text-[#9E7641]">{instagramHeading.overline}</p>
          <span className="mx-auto mt-3 block h-px w-12 bg-[#E7CAA0]" aria-hidden="true" />
          <h2 className="mt-4 text-[32px] font-bold leading-[1.1] text-[#9E7641] lg:text-[48px]">{instagramHeading.title}</h2>
          <p className="text-body mx-auto mt-4 max-w-md text-neutral-warm-500">{instagramHeading.description}</p>

          <a
            href={businessInfo.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="group mt-8 inline-flex items-center gap-2.5 rounded-full border border-[#E7CAA0]/40 bg-[#E7CAA0]/[0.06] px-6 py-3 text-body font-semibold text-[#9E7641] backdrop-blur-sm transition-all duration-300 ease-out hover:border-[#E7CAA0]/70 hover:bg-[#E7CAA0]/10 hover:shadow-[0_0_32px_-8px_rgba(231,202,160,0.5)]"
          >
            <InstagramIcon className="h-4 w-4" />
            View on Instagram
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>
      </div>

      {state === 'loading' ? (
        <div className="container-elato mt-12 flex gap-6 overflow-hidden lg:mt-16">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard
              key={i}
              className="h-[26rem] w-[82vw] max-w-[300px] flex-none rounded-[30px] md:w-[46vw] md:max-w-[320px] lg:w-[320px]"
            />
          ))}
        </div>
      ) : (
        <motion.div initial="hidden" whileInView="visible" viewport={viewportOnce} variants={headingReveal} className="mt-10 lg:mt-14">
          <InstagramFanCarousel reels={items} />
        </motion.div>
      )}
    </motion.section>
  )
}
