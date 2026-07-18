import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Camera } from 'lucide-react'
import type { InstagramReel } from '../../content/instagramContent'

interface InstagramFanCarouselProps {
  reels: InstagramReel[]
}

const DESKTOP_VISIBLE_SLOTS = 7
const MOBILE_VISIBLE_SLOTS = 3

const FAN_POSITIONS = [
  { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
  { rot: -14, scale: 0.8498, x: -22, y: 4.0, zIndex: 2 },
  { rot: -7, scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
  { rot: 0, scale: 1.0, x: 0, y: 0.0, zIndex: 10 },
  { rot: 7, scale: 0.9346, x: 11, y: 1.3, zIndex: 3 },
  { rot: 14, scale: 0.8498, x: 22, y: 4.0, zIndex: 2 },
  { rot: 21, scale: 0.7756, x: 30, y: 7.3, zIndex: 1 },
]

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function getRotationMultiplier(width: number) {
  return width < 640 ? 0.14 : 1
}

function getVisibleSlotCount(width: number) {
  return width < 640 ? MOBILE_VISIBLE_SLOTS : DESKTOP_VISIBLE_SLOTS
}

function getResponsiveMultiplier(width: number) {
  if (width < 480) return 0.14
  if (width < 640) return 0.2
  if (width < 768) return 0.5
  if (width < 1024) return 0.74
  return 0.96
}

/** Scales y-offsets and entry distances down when the viewport is too short for the ideal layout height. */
function getHeightMultiplier(width: number) {
  let idealPx: number
  if (width < 480) idealPx = 26 * 16
  else if (width < 640) idealPx = 28 * 16
  else if (width < 768) idealPx = 30 * 16
  else if (width < 1024) idealPx = 34 * 16
  else idealPx = 38 * 16

  const available = window.innerHeight * 0.72
  const base = available >= idealPx ? 1 : available / idealPx
  // Mobile cards sit flat in a row (no rainbow-curve y-offset); only
  // desktop/tablet keep the fanned arc.
  return width < 640 ? 0 : base
}

function getSlotConfig(totalCards: number, slot: number) {
  if (totalCards >= DESKTOP_VISIBLE_SLOTS) return FAN_POSITIONS[slot]
  const center = totalCards >> 1
  const distance = totalCards > 1 ? (slot - center) / center : 0
  const absDistance = Math.abs(distance)
  return {
    rot: distance * 21,
    scale: 1.0 - 0.2244 * absDistance * absDistance,
    x: distance * 30,
    y: absDistance * absDistance * 7.3,
    zIndex: 10 - Math.abs(slot - center),
  }
}

const ARROW_CLASSES =
  'relative flex items-center justify-center rounded-full border border-primary-300 bg-surface-elevated/90 text-secondary-900/50 backdrop-blur-md shadow-elato-md cursor-pointer shrink-0 z-30 outline-none hover:border-secondary-500/40 hover:text-secondary-500 active:scale-95 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-secondary-500'

/**
 * Instagram's own 3D fan-stack carousel — same GSAP fan-position engine as
 * Celebré's `CardFanCarousel`, deliberately forked rather than shared: the
 * card content/appearance here (image-first, focused-card glass caption
 * panel with a page counter) is Instagram-specific and unrelated to
 * Celebré's specials cards, so this stays an isolated, swappable component
 * rather than adding branching to a component another page already depends
 * on (same isolation principle CardFanCarousel itself documents).
 *
 * Every card is a full-bleed image (`absolute inset-0 object-cover`) so
 * the focused vs. side-card difference is purely in the bottom overlay's
 * content, not its layout height — side cards get a plain gradient scrim
 * with two short lines; the current center card (tracked via `centerIndex`,
 * compared directly against each card's own array index — not the GSAP
 * "slot", which only exists inside the animation effect) gets a taller
 * frosted/blurred panel with the title, full caption and an "n / total"
 * counter, echoing the reference's expanded info card without inventing
 * data (no address/coordinates/Expand — Instagram reels don't have that).
 */
export function InstagramFanCarousel({ reels }: InstagramFanCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isAnimating = useRef(false)
  const hasEntered = useRef(false)
  const directionRef = useRef<'left' | 'right' | null>(null)
  const prevVisible = useRef<Set<number>>(new Set())
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const totalCards = reels.length
  const [centerIndex, setCenterIndex] = useState(totalCards >> 1)

  // Always slot-by-rotational-distance-from-center (never a fixed identity
  // map) — the number of *visible* slots is always
  // min(totalCards, getVisibleSlotCount(width)) (3 on mobile, 7 otherwise),
  // so on mobile a 6-reel set still only ever shows 3 at once, sliding the
  // rest in/out exactly like the desktop >7-card window does. Even when
  // every card fits on screen at once, each card's *slot* still shifts by
  // one on every cycle() call, so the whole fan physically reshuffles
  // around the new center on each arrow click instead of just swapping
  // which card looks focused in place.
  const getVisibleMap = useCallback(
    (center: number) => {
      const map = new Map<number, number>()
      const visibleCount = Math.min(totalCards, getVisibleSlotCount(window.innerWidth))
      const half = Math.floor(visibleCount / 2)
      for (let slot = 0; slot < visibleCount; slot++) {
        map.set((((center + slot - half) % totalCards) + totalCards) % totalCards, slot)
      }
      return map
    },
    [totalCards],
  )

  const cycle = useCallback(
    (direction: 'left' | 'right') => {
      if (isAnimating.current || totalCards <= 1) return
      isAnimating.current = true
      directionRef.current = direction
      setCenterIndex((prev) => (direction === 'right' ? (prev + 1) % totalCards : (prev - 1 + totalCards) % totalCards))
    },
    [totalCards],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container || !totalCards) return

    const cardElements = Array.from(container.querySelectorAll<HTMLElement>('.fan-card'))
    if (!cardElements.length) return

    const reduceMotion = prefersReducedMotion()
    const visibleMap = getVisibleMap(centerIndex)
    const previouslyVisible = prevVisible.current
    const direction = directionRef.current
    const isFirstMount = !hasEntered.current
    const multiplier = getResponsiveMultiplier(window.innerWidth)
    const hMult = getHeightMultiplier(window.innerWidth)
    const rotMult = getRotationMultiplier(window.innerWidth)
    const slotCount = Math.min(totalCards, getVisibleSlotCount(window.innerWidth))
    const config = (slot: number) => getSlotConfig(slotCount, slot)

    if (isFirstMount) isAnimating.current = true

    let completedCount = 0
    const visibleCount = visibleMap.size
    const onCardDone = () => {
      if (++completedCount >= visibleCount) {
        isAnimating.current = false
        if (isFirstMount) hasEntered.current = true
      }
    }

    cardElements.forEach((card, cardIndex) => {
      const slot = visibleMap.get(cardIndex)
      const wasVisible = previouslyVisible.has(cardIndex)

      if (slot !== undefined) {
        const { x, y, rot, scale, zIndex } = config(slot)
        const target = {
          x: `${x * multiplier}rem`,
          y: `${y * hMult}rem`,
          rotation: rot * rotMult,
          scale,
          opacity: 1,
          zIndex,
        }

        if (reduceMotion) {
          gsap.set(card, target)
          onCardDone()
        } else if (isFirstMount) {
          gsap.set(card, { x: 0, y: `${10 * hMult}rem`, rotation: 0, scale: 0.5, opacity: 0 })
          gsap.to(card, { ...target, duration: 1.1, ease: 'elastic.out(1.05,.78)', delay: 0.15 + slot * 0.05, onComplete: onCardDone })
        } else if (!wasVisible) {
          const enterX = direction === 'right' ? 40 : -40
          gsap.set(card, { x: `${enterX}rem`, y: `${y * hMult}rem`, rotation: direction === 'right' ? 30 : -30, scale: 0.5, opacity: 0 })
          gsap.to(card, { ...target, duration: 0.55, ease: 'power2.out', onComplete: onCardDone })
        } else {
          gsap.to(card, { ...target, duration: 0.45, ease: 'power2.out', onComplete: onCardDone })
        }
      } else if (wasVisible) {
        const exitX = direction === 'right' ? -40 : 40
        if (reduceMotion) {
          gsap.set(card, { opacity: 0, zIndex: 0 })
        } else {
          gsap.to(card, { x: `${exitX}rem`, opacity: 0, scale: 0.5, rotation: direction === 'right' ? -30 : 30, duration: 0.35, ease: 'power2.in', zIndex: 0 })
        }
      } else if (isFirstMount) {
        gsap.set(card, { opacity: 0, scale: 0.3, x: 0, y: 0, zIndex: 0 })
      }
    })

    prevVisible.current = new Set(visibleMap.keys())

    if (reduceMotion) return

    // Desktop-only hover interactions — no-ops on touch devices.
    const visibleEntries: { el: HTMLElement; slot: number }[] = []
    cardElements.forEach((el, i) => {
      const slot = visibleMap.get(i)
      if (slot !== undefined) visibleEntries.push({ el, slot })
    })
    visibleEntries.sort((a, b) => a.slot - b.slot)

    let activeSlot: number | null = null
    let leaveTimer: ReturnType<typeof setTimeout> | null = null
    const centerSlot = visibleEntries.length >> 1

    const updateHoverLayout = (hoveredSlot: number | null) => {
      const mult = getResponsiveMultiplier(window.innerWidth)
      const hM = getHeightMultiplier(window.innerWidth)

      visibleEntries.forEach(({ el, slot }) => {
        const base = config(slot)
        let targetX = base.x * mult
        let targetY = base.y * hM
        let targetRot = base.rot
        let targetScale = base.scale
        let delay = 0

        if (hoveredSlot !== null) {
          const distance = Math.abs(slot - hoveredSlot)
          delay = distance * 0.02

          if (slot === hoveredSlot) {
            targetY -= 2 * hM
            targetScale *= 1.06
          } else {
            const normalized = centerSlot > 0 ? (slot - centerSlot) / centerSlot : 0
            const pushStrength = 8 * (1 - Math.abs(normalized)) * (1 + 0.2 * Math.max(0, 3 - distance))

            if (slot < hoveredSlot) {
              targetX -= pushStrength * mult
              targetRot -= 3 / (distance + 1)
            } else {
              targetX += pushStrength * mult
              targetRot += 3 / (distance + 1)
            }
          }
        } else {
          delay = Math.abs(slot - centerSlot) * 0.02
        }

        gsap.to(el, {
          x: `${targetX}rem`,
          y: `${targetY}rem`,
          rotation: targetRot,
          scale: targetScale,
          duration: 0.45,
          delay,
          ease: 'elastic.out(1,.75)',
          overwrite: 'auto',
        })
        gsap.set(el, { zIndex: base.zIndex })
      })
    }

    const enterHandlers = visibleEntries.map(({ el, slot }) => {
      const handler = () => {
        if (isAnimating.current) return
        if (leaveTimer) {
          clearTimeout(leaveTimer)
          leaveTimer = null
        }
        if (activeSlot !== slot) {
          activeSlot = slot
          updateHoverLayout(slot)
        }
      }
      el.addEventListener('mouseenter', handler)
      return { el, handler }
    })

    const onMouseLeave = () => {
      if (isAnimating.current) return
      if (leaveTimer) clearTimeout(leaveTimer)
      leaveTimer = setTimeout(() => {
        activeSlot = null
        updateHoverLayout(null)
      }, 50)
    }
    container.addEventListener('mouseleave', onMouseLeave)

    const onResize = () => {
      if (!isAnimating.current) updateHoverLayout(activeSlot)
    }
    window.addEventListener('resize', onResize)

    return () => {
      enterHandlers.forEach(({ el, handler }) => el.removeEventListener('mouseenter', handler))
      container.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('resize', onResize)
      if (leaveTimer) clearTimeout(leaveTimer)
    }
  }, [centerIndex, totalCards, getVisibleMap])

  if (!totalCards) return null

  const chevron = (direction: 'left' | 'right') => (
    <svg className="relative z-[2] h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={direction === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
    </svg>
  )

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    touchStart.current = null
    if (Math.abs(dx) < 32 || Math.abs(dx) < Math.abs(dy)) return
    cycle(dx < 0 ? 'right' : 'left')
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full items-center justify-center overflow-x-clip px-3 sm:overflow-visible sm:px-0">
        <div
          ref={containerRef}
          onTouchStart={totalCards > 1 ? onTouchStart : undefined}
          onTouchEnd={totalCards > 1 ? onTouchEnd : undefined}
          className="fan-layout relative flex h-[clamp(30rem,18rem_+_24vw,38rem)] w-full max-w-[84rem] touch-pan-y items-center justify-center"
        >
          {reels.map((reel, i) => {
            const isFocused = i === centerIndex

            const card = (
              <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-[#E7CAA0]/30 bg-[#140E09] shadow-elato-lg">
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

                {isFocused ? (
                  <>
                    <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[#140E09] via-[#140E09]/85 to-transparent" aria-hidden="true" />
                    <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#140E09]/55 p-5 backdrop-blur-xl sm:p-6">
                      <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-[#E7CAA0] sm:text-xl">{reel.title}</h3>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#140E09]/90 via-[#140E09]/20 to-transparent" aria-hidden="true" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4">
                      <h3 className="line-clamp-1 text-sm font-semibold leading-snug text-[#E7CAA0]">{reel.title}</h3>
                      <span className="flex items-center gap-1.5 text-[11px] text-[#E7CAA0]/70">
                        <Camera className="h-3 w-3 shrink-0" aria-hidden="true" />
                        {reel.isLive ? 'On Instagram' : 'Coming soon'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )

            return (
              <a
                key={reel.id}
                href={reel.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${reel.title} on Instagram`}
                className="fan-card absolute inset-0 m-auto h-[clamp(24rem,13rem_+_17vw,27rem)] w-[clamp(15rem,9.5rem_+_11vw,19rem)] outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
              >
                {card}
              </a>
            )
          })}
        </div>
      </div>

      {totalCards > 1 && (
        <div className="z-30 mt-5 flex items-center justify-center gap-4 md:-mt-20">
          <button className={`${ARROW_CLASSES} h-10 w-10 md:h-12 md:w-12`} onClick={() => cycle('left')} aria-label="Previous reel">
            {chevron('left')}
          </button>
          <div className="flex items-center gap-2">
            {reels.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  i === centerIndex ? 'scale-[1.3] bg-secondary-500' : 'bg-primary-300'
                }`}
              />
            ))}
          </div>
          <button className={`${ARROW_CLASSES} h-10 w-10 md:h-12 md:w-12`} onClick={() => cycle('right')} aria-label="Next reel">
            {chevron('right')}
          </button>
        </div>
      )}
    </div>
  )
}
