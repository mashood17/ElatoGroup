import { useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PinnedHeroRevealProps {
  hero: ReactNode
  next: ReactNode
}

/**
 * Pinned Hero → next-section reveal, built entirely from CSS grid + sticky
 * positioning — no scroll-linked transform, no manual height measurement.
 *
 * Hero and `next` are placed in the *same* grid cell ([grid-area:1/1]), so
 * their boxes overlap. Hero's wrapper is sticky, pinning it to the top of
 * the viewport. `next` sits in normal flow inside that same cell, pushed
 * down by exactly one viewport height (mt-[100vh]) — so it starts
 * completely below the fold and rises into view as the user scrolls,
 * arriving flush with the top exactly when Hero's sticky range ends.
 * `next` (position: relative, later in DOM order than Hero's sticky
 * wrapper) paints above it, so it visually covers the hero as it rises.
 *
 * Shared by every page that needs the Home page's Hero → Services reveal
 * behavior (see HeroServicesReveal, the original implementation this was
 * extracted from) so the interaction stays identical across pages instead
 * of drifting through copy-paste.
 *
 * The outer wrapper needs `position: relative` (even with no z-index) so it
 * participates in the same "positioned" stacking tier as every section
 * after it — see HeroServicesReveal's doc comment for the full reasoning.
 */
export function PinnedHeroReveal({ hero, next }: PinnedHeroRevealProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <>
        {hero}
        {next}
      </>
    )
  }

  return (
    <div className="relative grid">
      <div className="sticky top-0 h-screen [grid-area:1/1]">{hero}</div>
      <div className="relative mt-[100vh] [grid-area:1/1]">{next}</div>
    </div>
  )
}
