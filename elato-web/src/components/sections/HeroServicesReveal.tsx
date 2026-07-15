import { HomeHero } from './HomeHero'
import { Services } from './Services'
import { PinnedHeroReveal } from './PinnedHeroReveal'

/**
 * Home page's pinned Hero → Services reveal. The actual sticky/grid
 * mechanics live in PinnedHeroReveal (shared across pages); this wrapper
 * just supplies Home's own Hero + Services pair.
 */
export function HeroServicesReveal() {
  return <PinnedHeroReveal hero={<HomeHero />} next={<Services />} />
}
