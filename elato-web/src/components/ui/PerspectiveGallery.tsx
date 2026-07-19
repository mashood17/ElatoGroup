import { useCallback, useEffect, useState } from 'react'
import { animate, motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion'

export interface PerspectiveGalleryItem {
  id: string
  caption: string
  url?: string
}

interface PerspectiveGalleryProps {
  items: PerspectiveGalleryItem[]
  ariaLabel: string
}

const gradients = [
  'from-primary-300 to-secondary-500',
  'from-secondary-500 to-primary-100',
  'from-primary-100 to-secondary-700',
  'from-secondary-700 to-primary-300',
]

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const wrapIndex = (n: number, total: number) => ((Math.round(n) % total) + total) % total

function useViewportTier() {
  const [tier, setTier] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setTier(w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop')
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return tier
}

const TIER_CONFIG = {
  mobile: { half: 1, spacing: 163, rotate: 14, depth: 60, stageHeight: '23.5rem' },
  tablet: { half: 2, spacing: 274, rotate: 18, depth: 104, stageHeight: '26.5rem' },
  desktop: { half: 2, spacing: 414, rotate: 22.5, depth: 133, stageHeight: '29.5rem' },
} as const

// A single spring drives the shared `position` motion value; every card's
// x/rotateY/z/scale/opacity is a pure `useTransform` derivation of it, so
// the whole gallery glides as one continuous motion instead of N
// independently-sprung cards — the idiomatic framer-motion way to keep a
// multi-element gesture buttery at 60fps without React re-rendering per frame.
const SETTLE_SPRING = { type: 'spring', stiffness: 90, damping: 22, mass: 1.2 } as const

interface CardProps {
  item: PerspectiveGalleryItem
  index: number
  gradient: string
  position: MotionValue<number>
  total: number
  half: number
  spacing: number
  rotate: number
  depth: number
}

function PerspectiveCard({ item, index, gradient, position, total, half, spacing, rotate, depth }: CardProps) {
  const distance = useTransform(position, (pos) => {
    const d = index - pos
    // Wrap to the nearest of infinitely many equivalent positions
    // (index, index ± total, index ± 2*total, ...) — `position` keeps
    // accumulating indefinitely across swipes/loops rather than resetting,
    // so this must handle any distance, not just one lap's worth.
    return total > 2 ? d - total * Math.round(d / total) : d
  })
  const absDistance = useTransform(distance, (d) => Math.abs(d))
  const x = useTransform(distance, (d) => d * spacing)
  const rotateY = useTransform(distance, (d) => clamp(d, -2.4, 2.4) * rotate)
  const z = useTransform(absDistance, (ad) => -Math.min(ad, 2.4) * depth)
  const scale = useTransform(absDistance, (ad) => 1 - clamp(ad, 0, 2) * 0.04)
  const opacity = useTransform(absDistance, (ad) => clamp(1 - Math.max(0, ad - half) * 1.1, 0, 1))
  const zIndex = useTransform(absDistance, (ad) => Math.round(100 - ad * 10))

  return (
    <motion.div
      className="absolute aspect-[4/3.6] w-[clamp(19.5rem,12.5rem_+_22vw,31rem)] sm:aspect-[6/5]"
      style={{ x, rotateY, z, scale, opacity, zIndex, willChange: 'transform' }}
    >
      <div
        className="h-full w-full overflow-hidden rounded-[36px] border-[1.5px] border-[#9e7641]/45 bg-secondary-900/40"
        style={{
          boxShadow: '0 30px 70px -30px rgba(0,0,0,0.5), 0 0 0 4px rgba(158,118,65,0.1), 0 0 40px -14px rgba(158,118,65,0.4)',
        }}
      >
        {item.url ? (
          <img
            src={item.url}
            alt={item.caption}
            draggable={false}
            loading="lazy"
            decoding="async"
            className="h-full w-full rounded-[36px] object-cover"
          />
        ) : (
          <div className={`h-full w-full rounded-[36px] bg-gradient-to-br ${gradient}`} aria-hidden="true" />
        )}
        <div
          className="absolute inset-x-0 bottom-0 h-2/5 rounded-b-[36px] bg-gradient-to-t from-black/75 via-black/25 to-transparent"
          aria-hidden="true"
        />
        <span className="absolute inset-x-0 bottom-0 line-clamp-2 px-4 pb-4 pt-6 text-[13px] font-medium leading-snug tracking-wide text-white sm:text-sm">
          {item.caption}
        </span>
      </div>
    </motion.div>
  )
}

/**
 * Shared floating perspective gallery — not a carousel. Cards sit along a
 * shallow arc via rotateY/translateZ/translateX driven by each card's
 * continuous distance from a shared `position` motion value (see
 * PerspectiveCard). Navigation is arrow-buttons/arrow-keys only — no
 * drag/swipe — and every step hands off to the same single spring animation
 * on that value, so each move settles with the same slow, weighted glide.
 * There is no active/inactive hierarchy — the whole stack reads as one
 * suspended, continuously-looping collection. Used by both Stay's "A
 * Glimpse Inside" and Events' "Captured Moments" — everything about the
 * cards/controls/motion is shared; only each page's own section background
 * differs.
 */
export function PerspectiveGallery({ items, ariaLabel }: PerspectiveGalleryProps) {
  const tier = useViewportTier()
  const { half, spacing, rotate, depth, stageHeight } = TIER_CONFIG[tier]

  const total = items.length
  const initialIndex = total > 0 ? Math.min(total >> 1, total - 1) : 0
  const position = useMotionValue(initialIndex)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    const mid = total > 0 ? Math.min(total >> 1, total - 1) : 0
    position.set(mid)
    setCurrentIndex(mid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total])

  const commitDelta = useCallback(
    (delta: number) => {
      if (total <= 1) return
      const target = Math.round(position.get()) + delta
      setCurrentIndex(wrapIndex(target, total))
      animate(position, target, SETTLE_SPRING)
    },
    [total, position],
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') commitDelta(-1)
    else if (e.key === 'ArrowRight') commitDelta(1)
  }

  if (!total) return null

  return (
    <div className="flex w-full flex-col items-center">
      <div
        role="group"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="relative flex w-full items-center justify-center outline-none"
        style={{ height: stageHeight, perspective: '1600px' }}
      >
        {items.map((item, i) => {
          // Cap how many cards are simultaneously mounted and animating.
          // Wrapped with the same nearest-multiple math as each card's own
          // distance transform, so this stays correct across any number of
          // loops, not just a raw index subtraction. Trimmed once more, from
          // `half + 1` to `half` — per the opacity formula below, cards at
          // `half + 1` already render at exactly 0 opacity at rest (only a
          // sub-2% flicker for a fraction of a second while the shared
          // spring is mid-transition), so this ring was effectively
          // invisible while still running a full 7-value useTransform chain
          // and holding a permanent `willChange: 'transform'` GPU layer.
          const rawGap = i - currentIndex
          const gap = total > 2 ? rawGap - total * Math.round(rawGap / total) : rawGap
          if (Math.abs(gap) > half) return null

          return (
            <PerspectiveCard
              key={item.id}
              item={item}
              index={i}
              gradient={gradients[i % gradients.length]}
              position={position}
              total={total}
              half={half}
              spacing={spacing}
              rotate={rotate}
              depth={depth}
            />
          )
        })}
      </div>

      {total > 1 && (
        <div className="z-30 mt-1 flex items-center justify-center gap-4 lg:-mt-4">
          <button
            type="button"
            onClick={() => commitDelta(-1)}
            aria-label="Previous photo"
            className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-primary-300 bg-surface-elevated/90 text-secondary-900/50 shadow-elato-md outline-none backdrop-blur-md transition-colors duration-300 hover:border-secondary-500/40 hover:text-secondary-500 focus-visible:ring-2 focus-visible:ring-secondary-500 active:scale-95 md:h-12 md:w-12"
          >
            <svg className="relative z-[2] h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {items.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'scale-[1.3] bg-secondary-500' : 'bg-primary-300'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => commitDelta(1)}
            aria-label="Next photo"
            className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-primary-300 bg-surface-elevated/90 text-secondary-900/50 shadow-elato-md outline-none backdrop-blur-md transition-colors duration-300 hover:border-secondary-500/40 hover:text-secondary-500 focus-visible:ring-2 focus-visible:ring-secondary-500 active:scale-95 md:h-12 md:w-12"
          >
            <svg className="relative z-[2] h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
