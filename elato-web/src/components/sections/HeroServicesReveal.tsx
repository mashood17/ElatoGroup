import { useEffect, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { HomeHero } from './HomeHero'
import { Services } from './Services'

// Minimum finger travel (px) before a touchmove counts as a real
// scene-change gesture (either direction) rather than a tap wobble. Any
// gesture past this — tiny nudge or full flick — triggers the same single
// transition.
const TOUCH_INTENT_PX = 6

// How much the vertical component of a gesture must exceed its horizontal
// component before it's eligible to trigger the page transition at all.
// Services' mobile carousel is a horizontal swipe strip living on the same
// screen this controller listens across, and a real horizontal swipe is
// almost never perfectly axis-aligned — some vertical drift is inevitable.
// Without this, that drift alone (once past TOUCH_INTENT_PX) could read as
// scroll intent and fire the transition mid-swipe, most confusingly right
// after the last card, where the carousel has nowhere further to consume
// the gesture. Requiring vertical to clearly dominate (not just narrowly
// win) keeps every horizontal carousel gesture — including diagonal
// noise — entirely off this controller's radar; only a genuinely vertical
// gesture ever reaches the trigger checks below.
const AXIS_DOMINANCE_RATIO = 1.2

// Length of the scripted Hero → Services glide. Time-based (not
// distance-based): the trip is always ~one viewport, and a fixed 900ms with
// an ease-in-out curve is what gives it the slow, deliberate, cinematic feel
// instead of a scrollIntoView snap.
const GLIDE_DURATION_MS = 900

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Hero → Services — one scene change, same behaviour on every breakpoint.
 *
 * Hero is a plain 100vh section with Services as its normal next sibling —
 * no pin, no sticky reveal, no extra scroll range, no spacer. While Hero is
 * on screen, this controller intercepts downward input (wheel/trackpad tick,
 * or a touchmove past a tiny intent threshold) with `preventDefault()`
 * before the browser commits to a native scroll, and instead runs one
 * scripted, eased glide of `window.scrollTo` that lands exactly on Services'
 * top edge.
 *
 * The return trip mirrors this in reverse once Services is settled as the
 * resting scene. Both glides share one `animating` lock, dropped the instant
 * the ~900ms rAF loop ends — no grace window, no timer that could outlive
 * the animation.
 *
 * The visual fade is not scripted separately: Hero's opacity (video
 * included, plus a slight downward lag that lets Services slide up *over*
 * it like a curtain) is mapped off scroll position itself, eased to
 * dissolve gradually across the *whole* glide rather than finishing early —
 * so the two scenes read as one continuous transformation instead of a fade
 * followed by an arrival. The glide animates scroll, so that dissolve rides
 * the same eased curve for free — and scrolling back up from Services
 * naturally un-fades the Hero, keeping both directions consistent.
 */
export function HeroServicesReveal() {
  const reduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // Hero (video included) dissolves across the *entire* glide, not a
  // truncated lead-in — shaped as an ease so it barely dims through the
  // opening stretch (Hero still reads as the dominant image, just beginning
  // to soften) before dissolving through the middle and settling fully
  // transparent exactly as the glide lands. A straight two-stop linear fade
  // finishing early (the previous [0, 0.85] range) left a dead final beat
  // where nothing was visibly changing before touchdown — the scene read as
  // "fade, then arrive" instead of one unbroken transformation. Lag mirrors
  // the same shape at a calmer magnitude, so the two properties move as one
  // coordinated drift rather than two independently-timed effects.
  const heroFade = useTransform(scrollYProgress, [0, 0.35, 0.75, 1], [1, 0.94, 0.22, 0])
  const heroLag = useTransform(scrollYProgress, [0, 0.35, 0.75, 1], ['0%', '3%', '16%', '24%'])

  // Transition controller — the single owner of the Hero → Services
  // handoff on every input type. One effect, three listeners, torn down
  // whole on cleanup.
  useEffect(() => {
    if (reduceMotion) return
    const heroEl = containerRef.current
    if (!heroEl) return
    // Non-nullable local: TS narrowing from the guard above doesn't reach
    // into the nested closures below.
    const hero: HTMLDivElement = heroEl
    // Services renders as this component's own JSX sibling below (see the
    // return at the bottom of this file) — mounted in the same render pass
    // as Hero, not behind a lazy route boundary — so this lookup is always
    // reliable by the time this effect runs.
    const servicesEl = document.getElementById('services')

    let animating = false
    let rafId = 0
    let touchStartY = 0
    let touchStartX = 0
    // Most recent known finger position, updated on every touch event
    // regardless of whether that event triggered anything — used to give a
    // continued (non-lifted) drag a completely fresh reference point the
    // instant a glide lands, so it always needs a full new intent threshold
    // of movement before it can trigger anything again.
    let lastTouchY = 0
    let lastTouchX = 0

    // Measured fresh at every use — mobile browsers resize the viewport as
    // the address bar collapses/expands, and desktop windows can be
    // resized, either of which moves this landing target.
    const servicesTop = () => hero.offsetTop + hero.offsetHeight
    const heroOnScreen = () => window.scrollY < servicesTop() - 1

    const EDGE_EPSILON_PX = 1

    // "Services is the active scene" = its box fully spans the viewport,
    // top to bottom. Read directly off its live geometry — the same source
    // of truth the shared chrome-visibility store uses.
    const isServicesFillingViewport = () => {
      if (!servicesEl) return false
      const rect = servicesEl.getBoundingClientRect()
      return rect.top <= EDGE_EPSILON_PX && rect.bottom >= window.innerHeight - EDGE_EPSILON_PX
    }

    // Whether Services is *currently the settled, at-rest scene* — the only
    // state in which an upward gesture may trigger the Services → Hero
    // glide. Set from the browser's own confirmation that a scroll has
    // finished (`scrollend`), never a guess mid-motion.
    let servicesResting = false
    function onScrollStart() {
      servicesResting = false
    }
    function onScrollEnd() {
      servicesResting = !animating && isServicesFillingViewport()
    }

    function glide(targetY: number) {
      animating = true
      const startY = window.scrollY
      const distance = targetY - startY
      const startTime = performance.now()
      const step = (now: number) => {
        const t = Math.min(1, (now - startTime) / GLIDE_DURATION_MS)
        window.scrollTo(0, startY + distance * easeInOutCubic(t))
        if (t < 1) {
          rafId = requestAnimationFrame(step)
        } else {
          // Control returns the instant the animation itself ends — no
          // grace window afterward. A fresh baseline right here means a
          // drag that never lifted its finger through the whole glide
          // needs a full new intent threshold before it can trigger
          // anything again, instead of being judged against where the
          // gesture started well before landing.
          animating = false
          touchStartY = lastTouchY
          touchStartX = lastTouchX
        }
      }
      rafId = requestAnimationFrame(step)
    }

    function onWheel(e: WheelEvent) {
      if (animating) {
        e.preventDefault()
        return
      }
      // A horizontal trackpad pan (e.g. over the mobile carousel on a
      // touchscreen-plus-trackpad device) reports mostly deltaX with some
      // incidental deltaY — never eligible to trigger the page transition.
      const isVerticalGesture = Math.abs(e.deltaY) > Math.abs(e.deltaX) * AXIS_DOMINANCE_RATIO
      if (isVerticalGesture && e.deltaY > 0 && heroOnScreen()) {
        e.preventDefault()
        glide(servicesTop())
      } else if (isVerticalGesture && e.deltaY < 0 && servicesResting) {
        e.preventDefault()
        glide(0)
      }
      // Any other tick — including a momentum tail, or one arriving while
      // still travelling toward Services — just scrolls natively; nothing
      // here holds a lock past the animation that owns it.
    }

    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0]?.clientY ?? 0
      touchStartX = e.touches[0]?.clientX ?? 0
      lastTouchY = touchStartY
      lastTouchX = touchStartX
    }

    function onTouchMove(e: TouchEvent) {
      const currentY = e.touches[0]?.clientY ?? touchStartY
      const currentX = e.touches[0]?.clientX ?? touchStartX
      lastTouchY = currentY
      lastTouchX = currentX
      if (animating) {
        // Swallow residual finger movement mid-glide only — released the
        // instant the glide's own rAF loop ends (see glide()).
        e.preventDefault()
        return
      }
      // positive = finger moved up = downward-scroll intent
      const travel = touchStartY - currentY
      const horizontalTravel = currentX - touchStartX
      // Services' carousel is a horizontal swipe strip on the same screen
      // this listens across. A real horizontal swipe is rarely perfectly
      // axis-aligned, so vertical drift alone (once past TOUCH_INTENT_PX)
      // could otherwise read as scroll intent — most confusingly right
      // after the last card, with nowhere further for the carousel to
      // consume the gesture. Requiring vertical to clearly dominate keeps
      // every horizontal carousel gesture off this controller entirely;
      // it's never prevented, so the carousel's own native scroll handles
      // it exclusively.
      const isVerticalGesture = Math.abs(travel) > Math.abs(horizontalTravel) * AXIS_DOMINANCE_RATIO
      if (isVerticalGesture && travel > TOUCH_INTENT_PX && heroOnScreen()) {
        e.preventDefault()
        glide(servicesTop())
      } else if (isVerticalGesture && -travel > TOUCH_INTENT_PX && servicesResting) {
        e.preventDefault()
        glide(0)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    // Both passive and read-only: neither intercepts or alters a scroll in
    // progress. `scroll` only disarms; `scrollend` — the browser's own
    // "this scroll has finished" event — is the sole place arming happens.
    window.addEventListener('scroll', onScrollStart, { passive: true })
    window.addEventListener('scrollend', onScrollEnd, { passive: true })
    // Establishes the initial armed/disarmed state on mount (e.g. a page
    // refresh landing already settled on Services) rather than waiting for
    // the first subsequent scroll to finish.
    onScrollEnd()

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('scroll', onScrollStart)
      window.removeEventListener('scrollend', onScrollEnd)
      cancelAnimationFrame(rafId)
    }
  }, [reduceMotion])

  if (reduceMotion) {
    return (
      <>
        <HomeHero />
        <Services />
      </>
    )
  }

  return (
    <>
      <div ref={containerRef} className="relative h-screen overflow-hidden bg-[#191410]">
        <motion.div
          style={{
            opacity: heroFade,
            y: heroLag,
            willChange: 'transform, opacity',
          }}
          className="h-full w-full"
        >
          <HomeHero />
        </motion.div>
        {/* Continuity seam — the exact mirror (same color, opacity, height)
            of Services' own top vignette, sitting statically at Hero's
            bottom edge regardless of scroll position. Once the fading video
            above dissolves to nothing, this is what's left showing right at
            the container boundary; Services picks up an identical glow at
            its own top edge, so the two containers meet in matching warm
            tone instead of one flat color abutting a different one — no
            geometry change, just removing the color/light discontinuity
            that made the boundary readable as a seam. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#2C2318]/60 to-transparent"
        />
      </div>
      <Services />
    </>
  )
}
