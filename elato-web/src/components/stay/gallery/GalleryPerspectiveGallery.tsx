import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { StayGalleryTile } from './GalleryItem'

interface GalleryPerspectiveGalleryProps {
  items: StayGalleryTile[]
}

const gradients = [
  'from-primary-300 to-secondary-500',
  'from-secondary-500 to-primary-100',
  'from-primary-100 to-secondary-700',
  'from-secondary-700 to-primary-300',
]

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

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
  mobile: { half: 1, spacing: 110, rotate: 14, depth: 40, stageHeight: '13rem' },
  tablet: { half: 2, spacing: 185, rotate: 18, depth: 70, stageHeight: '16rem' },
  desktop: { half: 2, spacing: 280, rotate: 22.5, depth: 90, stageHeight: '18rem' },
} as const

const SPRING = { type: 'spring', stiffness: 260, damping: 32, mass: 0.9 } as const

/**
 * "A Glimpse Inside" — a floating perspective gallery, not a carousel.
 * Cards sit along a shallow arc via rotateY/translateZ/translateX driven by
 * each card's continuous distance from a draggable center index (mouse
 * drag, touch swipe, and wheel all feed the same `dragPx` offset). There is
 * no active/inactive hierarchy, no arrows, no dots — the whole stack reads
 * as one suspended collection, and momentum settles with a spring on release.
 */
export function GalleryPerspectiveGallery({ items }: GalleryPerspectiveGalleryProps) {
  const tier = useViewportTier()
  const { half, spacing, rotate, depth, stageHeight } = TIER_CONFIG[tier]

  const total = items.length
  const [currentIndex, setCurrentIndex] = useState(() => Math.min(total >> 1, total - 1))
  const [dragPx, setDragPx] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const pointerStartX = useRef(0)
  const activePointerId = useRef<number | null>(null)

  useEffect(() => {
    setCurrentIndex((i) => ((i % total) + total) % total)
  }, [total])

  const commit = useCallback((next: number) => setCurrentIndex(((next % total) + total) % total), [total])

  const onPointerDown = (e: React.PointerEvent) => {
    if (total <= 1) return
    activePointerId.current = e.pointerId
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    pointerStartX.current = e.clientX
    setIsDragging(true)
    setDragPx(0)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (activePointerId.current !== e.pointerId) return
    setDragPx(e.clientX - pointerStartX.current)
  }

  const endDrag = (e: React.PointerEvent) => {
    if (activePointerId.current !== e.pointerId) return
    activePointerId.current = null
    const steps = Math.round(dragPx / spacing)
    if (steps !== 0) commit(currentIndex - steps)
    setIsDragging(false)
    setDragPx(0)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') commit(currentIndex - 1)
    else if (e.key === 'ArrowRight') commit(currentIndex + 1)
  }

  if (!total) return null

  const continuousIndex = currentIndex - dragPx / spacing

  return (
    <div className="flex w-full flex-col items-center">
      <div
        role="group"
        aria-label="Stay photo gallery — drag, swipe, or use arrow keys to browse"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative flex w-full touch-pan-y select-none items-center justify-center outline-none"
        style={{ height: stageHeight, perspective: '1600px' }}
      >
        {items.map((item, i) => {
          let distance = i - continuousIndex
          if (total > 2) {
            if (distance > total / 2) distance -= total
            else if (distance < -total / 2) distance += total
          }
          const absDistance = Math.abs(distance)
          const overflow = Math.max(0, absDistance - half)
          const opacity = clamp(1 - overflow * 1.1, 0, 1)
          if (opacity <= 0.02) return null

          const scale = 1 - clamp(absDistance, 0, 2) * 0.04
          const x = distance * spacing
          const rotateY = clamp(distance, -2.4, 2.4) * rotate
          const translateZ = -Math.min(absDistance, 2.4) * depth
          const zIndex = Math.round(100 - absDistance * 10)

          return (
            <motion.div
              key={item.id}
              className="absolute aspect-[4/3] w-[clamp(14rem,9rem_+_15vw,21rem)] cursor-grab active:cursor-grabbing"
              style={{ zIndex }}
              animate={{ x, rotateY, z: translateZ, scale, opacity }}
              transition={isDragging ? { duration: 0 } : SPRING}
            >
              <div
                className="h-full w-full overflow-hidden rounded-[36px] border-[1.5px] border-[#9e7641]/45 bg-secondary-900/40"
                style={{
                  boxShadow:
                    '0 30px 70px -30px rgba(0,0,0,0.5), 0 0 0 4px rgba(158,118,65,0.1), 0 0 40px -14px rgba(158,118,65,0.4)',
                }}
              >
                {item.url ? (
                  <img
                    src={item.url}
                    alt={item.caption}
                    draggable={false}
                    loading="lazy"
                    className="h-full w-full rounded-[36px] object-cover"
                  />
                ) : (
                  <div className={`h-full w-full rounded-[36px] bg-gradient-to-br ${gradients[i % gradients.length]}`} aria-hidden="true" />
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
        })}
      </div>

      {total > 1 && (
        <div className="z-30 mt-1 flex items-center justify-center gap-4 lg:-mt-4">
          <button
            type="button"
            onClick={() => commit(currentIndex - 1)}
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
            onClick={() => commit(currentIndex + 1)}
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
