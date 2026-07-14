import { PremiumHero } from '../hero/PremiumHero'
import { celebreHero } from '../../content/celebreContent'
import celebreLogo from '../../assets/logos/celebre.PNG'

// Real pixel dimensions of the Celebré wordmark artwork.
const LOGO_ASPECT = 4484 / 1548

// Macron bounding box, measured directly from celebre.PNG's own pixel data
// (bottom-up UV) — not a guess, so the macron animation targets the real
// artwork on this page too.
const MACRON_RECT: [number, number, number, number] = [0.8269, 0.9113, 0.139, 0.0943]

export function CelebreHero() {
  return (
    <PremiumHero
      id="celebre-hero"
      logoSrc={celebreLogo}
      logoAlt="ELATŌ Celebré"
      logoAspect={LOGO_ASPECT}
      macronRect={MACRON_RECT}
      tagline={celebreHero.tagline}
    />
  )
}
