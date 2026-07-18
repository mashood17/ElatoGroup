import { useEffect, useState } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
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
      className="relative py-12 font-sans lg:py-24"
    >
      <SectionBackground image={sectionBackground} mobileImage={sectionBackgroundMobile} />
      <div className="container-elato">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={headingReveal}
          className="mx-auto max-w-xl text-center"
        >
          <p className="text-caption text-[#9E7641]">{instagramHeading.overline}</p>
          <span className="mx-auto mt-2 block h-px w-10 bg-[#E7CAA0]" aria-hidden="true" />
          <h2 className="mt-3 text-[30px] font-bold text-[#9E7641] lg:text-[42px]">{instagramHeading.title}</h2>
          <p className="text-body mt-3 text-neutral-warm-500">{instagramHeading.description}</p>

          <a
            href={businessInfo.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="group mt-5 hidden items-center justify-center gap-2 text-body font-semibold text-[#9E7641] lg:inline-flex"
          >
            View on Instagram
            <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
          </a>
        </motion.div>

        {/* Mobile CTA — desktop link lives inline with the heading above */}
        <a
          href={businessInfo.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="group mx-auto mt-6 flex w-fit items-center gap-2 text-body font-semibold text-[#9E7641] lg:hidden"
        >
          View on Instagram
          <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
        </a>
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
        <motion.div initial="hidden" whileInView="visible" viewport={viewportOnce} variants={headingReveal} className="mt-4 lg:-mt-2">
          <InstagramFanCarousel reels={items} />
        </motion.div>
      )}
    </motion.section>
  )
}
