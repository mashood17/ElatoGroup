import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { HomeHero } from './HomeHero'
import { Services } from './Services'

/**
 * Hero → Services transition — an Aceternity-style "container scroll", not
 * the old CSS-grid overlap. Previous implementation stacked Hero and
 * Services in the *same* grid cell so Services (pushed down by exactly
 * Hero's own margin) would rise and physically cover Hero as it arrived.
 * That coupled the pin's duration to Services' own rendered height and,
 * because the two boxes only started overlapping right at the very end of
 * the pinned range, most of the scroll showed Hero shrinking in place with
 * nothing behind it — which is why layering transforms on that structure
 * read as "basically unchanged."
 *
 * This version removes that coupling entirely. `containerRef` below wraps
 * *only* Hero, sized taller than one viewport (100vh + a per-breakpoint
 * scroll allowance) purely to give the sticky pin room to run its
 * animation. Services is an ordinary next sibling, outside this wrapper,
 * in normal document flow — once the wrapper's extra height is used up,
 * the sticky Hero releases and Services simply continues scrolling up into
 * view the way any section would. No overlap math, no margin trick, no
 * dependency on Services' height.
 *
 * `scrollYProgress` is read off the wrapper itself, offset
 * `['start start', 'end start']`: progress 0 the instant the wrapper's top
 * reaches the viewport top (Hero starts pinning), progress 1 when the
 * wrapper's *bottom* reaches the viewport top — which happens after
 * exactly (wrapper height − 100vh) of scroll, i.e. precisely the sticky
 * range, whatever that allowance is set to per breakpoint. That progress
 * drives Hero's scale/rotateX/y directly (GPU transform only, no repaint-
 * triggering properties), giving it real depth via `perspective` on the
 * wrapper — a card receding in 3D as it releases, not a flat cover-up.
 */
export function HeroServicesReveal() {
  const reduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // Kept the receding-card feel but toned the 3D down to a standard,
  // cheaper range: a shallower rotateX and a wider perspective both shrink
  // how much of the foreshortened layer actually changes per frame, which
  // is what drove the GPU cost during scroll — the pin range is shorter too
  // so there's simply less scroll distance for it to run over.
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.96])
  const heroRotate = useTransform(scrollYProgress, [0, 1], [0, -3])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -20])

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
      <div
        ref={containerRef}
        className="relative h-[115vh] bg-surface-base sm:h-[120vh] lg:h-[130vh]"
        style={{ perspective: '2200px' }}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.div
            style={{
              scale: heroScale,
              rotateX: heroRotate,
              y: heroY,
              transformOrigin: 'center bottom',
              willChange: 'transform',
            }}
            className="h-full w-full"
          >
            <HomeHero />
          </motion.div>
        </div>
      </div>
      <Services />
    </>
  )
}
