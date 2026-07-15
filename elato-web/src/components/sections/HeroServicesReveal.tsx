import { useReducedMotion } from 'framer-motion'
import { HomeHero } from './HomeHero'
import { Services } from './Services'

/**
 * Pinned Hero → Services reveal, built entirely from CSS grid + sticky
 * positioning — no scroll-linked transform, no manual height measurement.
 *
 * Hero and Services are placed in the *same* grid cell ([grid-area:1/1]),
 * so their boxes overlap. Hero's wrapper is sticky, pinning it to the top
 * of the viewport. Services sits in normal flow inside that same cell,
 * pushed down by exactly one viewport height (mt-[100vh]) — so it starts
 * completely below the fold and rises into view as the user scrolls,
 * arriving flush with the top exactly when Hero's sticky range ends.
 * Services (position: relative, later in DOM order than Hero's sticky
 * wrapper) paints above it, so it visually covers the hero as it rises.
 *
 * Because the grid row's height is the browser's own layout computation —
 * 100vh from Hero, plus Services' true rendered height from its margin +
 * content — there is no distance to get out of sync with. About, rendered
 * immediately after this component, always starts exactly where Services'
 * real content ends, regardless of Services' height on any breakpoint.
 *
 * The outer wrapper needs `position: relative` (even with no z-index) so it
 * participates in the same "positioned" stacking tier as every section
 * after it. Without it, this wrapper is `position: static`, which always
 * paints behind positioned siblings regardless of DOM order or overlap —
 * so About's background (which intentionally bleeds ~160px above its own
 * top edge to crossfade into whatever precedes it) would win against this
 * entire block instead of just blending into Services' last 160px.
 */
export function HeroServicesReveal() {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <>
        <HomeHero />
        <Services />
      </>
    )
  }

  return (
    <div className="relative grid">
      <div className="sticky top-0 h-screen [grid-area:1/1]">
        <HomeHero />
      </div>
      <div className="relative mt-[100vh] [grid-area:1/1]">
        <Services />
      </div>
    </div>
  )
}
