import { useCallback, useEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type PanInfo,
} from 'framer-motion'
import { ArrowUpRight, Camera } from 'lucide-react'
import type { InstagramReel } from '../../content/instagramContent'

interface InstagramFanCarouselProps {
  reels: InstagramReel[]
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const wrapIndex = (n: number, total: number) => ((Math.round(n) % total) + total) % total

function shortestDelta(from: number, to: number, total: number) {
  let diff = (to - from) % total
  if (diff > total / 2) diff -= total
  if (diff < -total / 2) diff += total
  return diff
}

type Tier = 'mobile' | 'tablet' | 'desktop'

const TIER_CONFIG: Record<Tier, { half: number; spacing: number; rotate: number; depth: number; yStep: number }> = {
  mobile: { half: 1, spacing: 148, rotate: 9, depth: 56, yStep: 0 },
  tablet: { half: 2, spacing: 228, rotate: 15, depth: 104, yStep: 9 },
  desktop: { half: 2, spacing: 296, rotate: 19, depth: 138, yStep: 13 },
}

// One shared spring drives `position`; every card derives its x/y/z/rotate/
// scale/opacity from it via useTransform, so the whole stack glides as a
// single motion instead of N independently-animated cards (same technique
// as PerspectiveGallery) — GPU-cheap and buttery at 60fps.
const SETTLE_SPRING = { type: 'spring', stiffness: 220, damping: 26, mass: 0.9 } as const

function useViewportTier(): Tier {
  const [tier, setTier] = useState<Tier>('desktop')
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

interface SocialCardProps {
  reel: InstagramReel
  index: number
  total: number
  position: MotionValue<number>
  cfg: (typeof TIER_CONFIG)['mobile']
  isFocused: boolean
  isInteractive: boolean
  reduceMotion: boolean
  tiltX: MotionValue<number>
  tiltY: MotionValue<number>
  imgX: MotionValue<number>
  imgY: MotionValue<number>
  onLinkClickCapture: (e: React.MouseEvent) => void
}

function SocialCard({
  reel,
  index,
  total,
  position,
  cfg,
  isFocused,
  isInteractive,
  reduceMotion,
  tiltX,
  tiltY,
  imgX,
  imgY,
  onLinkClickCapture,
}: SocialCardProps) {
  const distance = useTransform(position, (pos) => {
    const d = index - pos
    return total > 2 ? d - total * Math.round(d / total) : d
  })
  const absDistance = useTransform(distance, (d) => Math.abs(d))
  const x = useTransform(distance, (d) => d * cfg.spacing)
  const rotateYBase = useTransform(distance, (d) => clamp(d, -(cfg.half + 0.4), cfg.half + 0.4) * cfg.rotate)
  const z = useTransform(absDistance, (ad) => -Math.min(ad, cfg.half + 0.4) * cfg.depth)
  const scale = useTransform(absDistance, (ad) => 1 - clamp(ad, 0, cfg.half + 1) * 0.07)
  const opacity = useTransform(absDistance, (ad) => clamp(1 - ad * 0.36, 0.16, 1))
  const y = useTransform(absDistance, (ad) => clamp(ad, 0, cfg.half + 1) * cfg.yStep)
  const zIndex = useTransform(absDistance, (ad) => Math.round(100 - ad * 10) + (isFocused ? 5 : 0))

  const rotateY = isFocused && !reduceMotion ? tiltY : rotateYBase
  const rotateX = isFocused && !reduceMotion ? tiltX : 0

  return (
    <motion.a
      href={reel.href}
      target="_blank"
      rel="noreferrer"
      aria-label={`View ${reel.title} on Instagram`}
      aria-hidden={!isInteractive}
      tabIndex={isInteractive ? 0 : -1}
      onClickCapture={onLinkClickCapture}
      style={{
        x,
        y,
        z,
        rotateX,
        rotateY,
        scale,
        opacity,
        zIndex,
        pointerEvents: isInteractive ? 'auto' : 'none',
        willChange: 'transform',
      }}
      className="absolute inset-0 m-auto h-[clamp(25rem,17rem_+_24vw,29rem)] w-[clamp(15rem,68vw,18.5rem)] outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 sm:h-[clamp(21.5rem,13rem_+_18vw,27.5rem)] sm:w-[clamp(16.5rem,40vw,19rem)] lg:w-[18.5rem]"
    >
      <div
        className={`relative flex h-full w-full flex-col overflow-hidden rounded-[30px] border bg-[#140E09] transition-colors duration-500 ${
          isFocused ? 'border-[#E7CAA0]/45' : 'border-[#E7CAA0]/15'
        }`}
        style={{
          boxShadow: isFocused
            ? '0 34px 70px -22px rgba(0,0,0,0.6), 0 0 0 1px rgba(231,202,160,0.12), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 46px -14px rgba(231,202,160,0.5)'
            : '0 20px 45px -24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <motion.div
          className="absolute inset-0"
          style={isFocused && !reduceMotion ? { x: imgX, y: imgY, scale: 1.06 } : undefined}
        >
          {reel.video ? (
            <video
              src={reel.video}
              poster={reel.image}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : reel.image ? (
            <img src={reel.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#9E7641] via-[#B5905E] to-[#E7CAA0]" aria-hidden="true" />
          )}
        </motion.div>

        {isFocused ? (
          <>
            <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[#140E09] via-[#140E09]/85 to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#140E09]/50 p-5 backdrop-blur-xl sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-[#E7CAA0] sm:text-xl">{reel.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-primary-100/80">{reel.description}</p>
                </div>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#E7CAA0]/70" aria-hidden="true" />
              </div>
              <div className="mt-3 flex items-center text-[11px] text-[#E7CAA0]/60">
                <span className="flex items-center gap-1.5">
                  <Camera className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {reel.isLive ? 'On Instagram' : 'Coming soon'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-[#140E09]/90 via-[#140E09]/25 to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4">
              <h3 className="line-clamp-1 text-sm font-semibold leading-snug text-[#E7CAA0]/90">{reel.title}</h3>
              <span className="flex items-center gap-1.5 text-[11px] text-[#E7CAA0]/60">
                <Camera className="h-3 w-3 shrink-0" aria-hidden="true" />
                {reel.isLive ? 'On Instagram' : 'Coming soon'}
              </span>
            </div>
          </>
        )}
      </div>
    </motion.a>
  )
}

/**
 * Instagram's premium 3D-stack carousel — a single shared `position` spring
 * (see SETTLE_SPRING) drives every card's depth/rotation/scale/opacity via
 * useTransform, the same architecture as `PerspectiveGallery`, deliberately
 * forked rather than shared: the focused-card caption panel, live-reel
 * video, drag-to-swipe and cursor parallax here are Instagram-specific.
 */
export function InstagramFanCarousel({ reels }: InstagramFanCarouselProps) {
  const reduceMotionPref = useReducedMotion()
  const reduceMotion = Boolean(reduceMotionPref)
  const tier = useViewportTier()
  const cfg = TIER_CONFIG[tier]

  const total = reels.length
  const initialIndex = total > 0 ? total >> 1 : 0
  const position = useMotionValue(initialIndex)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const suppressClickRef = useRef(false)

  const tiltXRaw = useMotionValue(0)
  const tiltYRaw = useMotionValue(0)
  const tiltX = useSpring(tiltXRaw, { stiffness: 200, damping: 24 })
  const tiltY = useSpring(tiltYRaw, { stiffness: 200, damping: 24 })
  const imgXRaw = useMotionValue(0)
  const imgYRaw = useMotionValue(0)
  const imgX = useSpring(imgXRaw, { stiffness: 160, damping: 22 })
  const imgY = useSpring(imgYRaw, { stiffness: 160, damping: 22 })

  const commitDelta = useCallback(
    (delta: number) => {
      if (total <= 1) return
      const target = Math.round(position.get()) + delta
      setCurrentIndex(wrapIndex(target, total))
      animate(position, target, reduceMotion ? { duration: 0.01 } : SETTLE_SPRING)
    },
    [total, position, reduceMotion],
  )

  const goTo = useCallback(
    (i: number) => {
      if (total <= 1) return
      const delta = shortestDelta(Math.round(position.get()), i, total)
      if (delta !== 0) commitDelta(delta)
    },
    [total, position, commitDelta],
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') commitDelta(-1)
    else if (e.key === 'ArrowRight') commitDelta(1)
  }

  const onDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info
    if (Math.abs(offset.x) > 56 || Math.abs(velocity.x) > 480) {
      commitDelta(offset.x < 0 ? 1 : -1)
    }
    window.setTimeout(() => {
      suppressClickRef.current = false
    }, 120)
  }

  const onDrag = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 8) suppressClickRef.current = true
  }

  const onLinkClickCapture = (e: React.MouseEvent) => {
    if (suppressClickRef.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const isPointerFine = useRef(typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches)

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !isPointerFine.current) return
    const bounds = e.currentTarget.getBoundingClientRect()
    const relX = (e.clientX - bounds.left) / bounds.width - 0.5
    const relY = (e.clientY - bounds.top) / bounds.height - 0.5
    tiltYRaw.set(relX * 7)
    tiltXRaw.set(-relY * 6)
    imgXRaw.set(-relX * 10)
    imgYRaw.set(-relY * 8)
  }

  const onMouseLeave = () => {
    tiltXRaw.set(0)
    tiltYRaw.set(0)
    imgXRaw.set(0)
    imgYRaw.set(0)
  }

  if (!total) return null

  const chevron = (direction: 'left' | 'right') => (
    <svg className="relative z-[2] h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={direction === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
    </svg>
  )

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full items-center justify-center overflow-x-clip px-3 sm:overflow-visible sm:px-0">
        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="ELATŌ Instagram reels"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          className="relative flex h-[clamp(31rem,20rem_+_26vw,36.5rem)] w-full max-w-[84rem] items-center justify-center outline-none sm:h-[clamp(28rem,17rem_+_22vw,35rem)]"
          style={{ perspective: '1600px' }}
        >
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[62%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E7CAA0]/20 blur-[70px]"
            style={{ zIndex: 0 }}
            animate={reduceMotion ? undefined : { opacity: [0.4, 0.65, 0.4], scale: [1, 1.05, 1] }}
            transition={reduceMotion ? undefined : { duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="relative h-full w-full touch-pan-y"
            drag={total > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            dragMomentum={false}
            onDrag={onDrag}
            onDragEnd={onDragEnd}
          >
            {reels.map((reel, i) => {
              const gap = shortestDelta(currentIndex, i, total)
              if (Math.abs(gap) > cfg.half + 2) return null
              return (
                <SocialCard
                  key={reel.id}
                  reel={reel}
                  index={i}
                  total={total}
                  position={position}
                  cfg={cfg}
                  isFocused={i === currentIndex}
                  isInteractive={Math.abs(gap) <= cfg.half}
                  reduceMotion={reduceMotion}
                  tiltX={tiltX}
                  tiltY={tiltY}
                  imgX={imgX}
                  imgY={imgY}
                  onLinkClickCapture={onLinkClickCapture}
                />
              )
            })}
          </motion.div>
        </div>
      </div>

      {total > 1 && (
        <div className="z-30 mt-6 flex items-center justify-center gap-5 lg:-mt-16">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#9e7641]/35 bg-white/[0.06] text-[#9e7641] shadow-[0_8px_24px_-10px_rgba(0,0,0,0.5)] outline-none backdrop-blur-xl transition-colors duration-300 hover:border-[#9e7641]/60 hover:bg-white/[0.12] focus-visible:ring-2 focus-visible:ring-secondary-500 md:h-14 md:w-14"
            onClick={() => commitDelta(-1)}
            aria-label="Previous reel"
          >
            {chevron('left')}
          </motion.button>

          <div className="flex items-center gap-2">
            {reels.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to reel ${i + 1}`}
                aria-current={i === currentIndex}
                className="h-2 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
                animate={{
                  width: i === currentIndex ? 26 : 8,
                  backgroundColor: i === currentIndex ? '#E7CAA0' : 'rgba(231,202,160,0.3)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#9e7641]/35 bg-white/[0.06] text-[#9e7641] shadow-[0_8px_24px_-10px_rgba(0,0,0,0.5)] outline-none backdrop-blur-xl transition-colors duration-300 hover:border-[#9e7641]/60 hover:bg-white/[0.12] focus-visible:ring-2 focus-visible:ring-secondary-500 md:h-14 md:w-14"
            onClick={() => commitDelta(1)}
            aria-label="Next reel"
          >
            {chevron('right')}
          </motion.button>
        </div>
      )}
    </div>
  )
}
