import { useEffect, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { HomeHero } from './HomeHero'
import { Services } from './Services'

// Minimum finger travel (px) before a touchmove counts as a real
// scene-change gesture (either direction) rather than a tap wobble. Any
// gesture past this — tiny nudge or full flick — triggers the same single
// transition.
const TOUCH_INTENT_PX = 6

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
 * no pin, no sticky reveal, no extra scroll range, no spacer. A single
 * transition controller (the effect below) owns the handoff — in both
 * directions, as exact mirrors of each other. While the Hero is on screen,
 * downward input — a touchmove past a tiny intent threshold, or any
 * wheel/trackpad tick — is intercepted at the source with
 * `preventDefault()`, before the browser commits to a native scroll, so no
 * momentum ever exists. In its place runs one scripted, eased glide of
 * `window.scrollTo` that lands exactly on Services' top edge and stops.
 * Upward input while parked at Services (or anywhere in the boundary zone
 * between the two scenes) triggers the identical glide back to the page
 * top, landing the Hero perfectly in the viewport — same easing, same
 * duration, same lock. During either glide all further input is swallowed —
 * `animating` is the only lock in this controller, and it exists solely for
 * the glide's own ~900ms. The instant that rAF loop ends, the lock drops
 * and scrolling is fully native again — no post-landing grace window, no
 * momentum-swallowing timer that could outlive the animation. A wheel tick
 * or touchmove that arrives after landing is judged fresh against the
 * current zone (heroOnScreen / servicesAtBoundary), so leftover momentum
 * either does nothing (already past the trigger zone) or just continues as
 * an ordinary native scroll — it can never hold the page hostage.
 *
 * The visual fade is not scripted separately: Hero's opacity (video
 * included, plus a slight downward lag that lets Services slide up *over*
 * it like a curtain) is mapped off scroll position itself, eased to
 * dissolve gradually across the *whole* glide rather than finishing early —
 * so the two scenes read as one continuous transformation instead of a fade
 * followed by an arrival. The glide animates scroll, so that dissolve rides
 * the same eased curve for free — and scrolling back up from Services
 * naturally un-fades the Hero, keeping both directions consistent. The
 * controller re-arms whenever the Hero is back on screen, so leaving it is
 * always this one transition.
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

    let animating = false
    let rafId = 0
    let touchStartY = 0
    // Most recent known finger position, updated on every touch event
    // regardless of whether that event triggered anything — used to give a
    // continued (non-lifted) drag a completely fresh reference point the
    // instant a glide lands, so it always needs a full new intent threshold
    // of movement before it can trigger anything again.
    let lastTouchY = 0

    // Measured fresh at every use — mobile browsers resize the viewport as
    // the address bar collapses/expands, and desktop windows can be
    // resized, either of which moves this landing target.
    const servicesTop = () => hero.offsetTop + hero.offsetHeight
    const heroOnScreen = () => window.scrollY < servicesTop() - 1
    // Mirror zone for the reverse trip: anywhere from just below the page
    // top down to the Services landing point. Parked at Services (the
    // normal case) sits exactly at the upper bound; anything in between is
    // a mid-transition park that glides home to the Hero the same way the
    // forward direction glides to Services.
    const servicesAtBoundary = () =>
      window.scrollY > 1 && window.scrollY <= servicesTop() + 1

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
        }
      }
      rafId = requestAnimationFrame(step)
    }

    function onWheel(e: WheelEvent) {
      if (animating) {
        e.preventDefault()
        return
      }
      if (e.deltaY > 0 && heroOnScreen()) {
        e.preventDefault()
        glide(servicesTop())
      } else if (e.deltaY < 0 && servicesAtBoundary()) {
        e.preventDefault()
        glide(0)
      }
      // Any other tick — including whatever momentum tail follows the
      // gesture that just triggered a glide — is left alone. By the time
      // it arrives `animating` is already true (swallowed above) or the
      // glide has already landed and the zone check above no longer
      // matches, so it simply scrolls natively; nothing here can hold a
      // lock past the animation that owns it.
    }

    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0]?.clientY ?? 0
      lastTouchY = touchStartY
    }

    function onTouchMove(e: TouchEvent) {
      const currentY = e.touches[0]?.clientY ?? touchStartY
      lastTouchY = currentY
      if (animating) {
        // Swallow residual finger movement mid-glide only — released the
        // instant the glide's own rAF loop ends (see glide()).
        e.preventDefault()
        return
      }
      // positive = finger moved up = downward-scroll intent
      const travel = touchStartY - currentY
      if (travel > TOUCH_INTENT_PX && heroOnScreen()) {
        e.preventDefault()
        glide(servicesTop())
      } else if (-travel > TOUCH_INTENT_PX && servicesAtBoundary()) {
        e.preventDefault()
        glide(0)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
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
