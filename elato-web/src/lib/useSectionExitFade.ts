import { useRef, type RefObject } from 'react'
import { useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'

export interface SectionExitFadeStyle {
  opacity: MotionValue<number>
  scale: MotionValue<number>
  y: MotionValue<number>
  filter: MotionValue<string>
}

/**
 * Cinematic scroll-linked exit fade, shared by every Home page section
 * (Apple/product-page style handoff). Entrance is left entirely to
 * whatever per-component reveal already exists (whileInView reveals,
 * staggered content) — this hook only governs how a section lets go of
 * focus as the next one arrives: held fully at rest while it's the primary
 * content on screen, then over its last third or so it eases opacity to 0,
 * scales down slightly, gains a soft blur and drifts up — finishing right
 * as the next section is about to fully occupy the viewport, so the
 * handoff reads as one continuous motion instead of a hard cut.
 *
 * Progress is read directly off the section's own box, offset
 * `['start start', 'end start']`: 0 when its top reaches the viewport top
 * (it's now filling the screen from that edge), 1 when its bottom reaches
 * the viewport top (the exact moment it's fully scrolled past and the next
 * section owns the screen). Tying the fade's end point to that real
 * handoff moment — rather than a fixed pixel/vh guess — means it lines up
 * correctly regardless of the section's height on any given screen size.
 *
 * The exit itself is shaped as an accelerating dissolve rather than a
 * linear ramp — a slow, barely-there drift through the first stretch after
 * FADE_START, then a deeper fall into blur/scale/opacity right at the end —
 * which reads as a deliberate, weighted departure (closer to a still
 * settling into soft focus) rather than a mechanical crossfade.
 */
export function useSectionExitFade<T extends HTMLElement = HTMLElement>(): {
  ref: RefObject<T | null>
  style: SectionExitFadeStyle
} {
  const ref = useRef<T>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  const STOPS = [0, 0.6, 0.84, 1]
  const opacity = useTransform(scrollYProgress, STOPS, reduceMotion ? [1, 1, 1, 1] : [1, 1, 0.5, 0])
  const scale = useTransform(scrollYProgress, STOPS, reduceMotion ? [1, 1, 1, 1] : [1, 1, 0.97, 0.935])
  const y = useTransform(scrollYProgress, STOPS, reduceMotion ? [0, 0, 0, 0] : [0, 0, -24, -52])
  // Blur is the one property in this fade that's genuinely expensive (a real
  // filter/repaint pass, unlike the transform-only properties above) — given
  // its own shorter, shallower curve so the browser only pays for the blur
  // compositing layer over the final ~22% of the section's exit (was ~40%,
  // then ~30%) and its peak radius is now under a third of the original.
  // Opacity/scale/y are untouched — they're cheap regardless of range, so
  // narrowing them further would only cost visual fidelity for no
  // performance gain.
  const BLUR_STOPS = [0, 0.78, 1]
  const blurPx = useTransform(scrollYProgress, BLUR_STOPS, reduceMotion ? [0, 0, 0] : [0, 0, 3])
  // `blur(0px)` and `none` render identically, but `blur(0px)` is still a
  // non-`none` filter value — browsers can keep the section pinned to its
  // own filter-compositing layer the entire time simply because *a* filter
  // is present, even while it's doing nothing. Sections spend roughly their
  // first 60% of scroll range at blur 0 (STOPS above), so emitting literal
  // `none` there instead avoids paying for that layer except during the
  // trailing stretch where the blur is actually animating.
  const filter = useTransform(blurPx, (v) => (v === 0 ? 'none' : `blur(${v}px)`))

  return { ref, style: { opacity, scale, y, filter } }
}
