import { PremiumHero } from '../hero/PremiumHero'
import { celebreHero, categories } from '../../content/celebreContent'
import celebreLogo from '../../assets/logos/celebre.PNG'
import celebreHeroImage from '../../assets/services/celebre.webp'

// Real pixel dimensions of the Celebré wordmark artwork. celebre.PNG was
// regenerated with margins matching elato-wordmark.png's proportions (the
// original file had the "Ō" flush against the canvas edge, which is what
// caused it to render clipped) — these values match the new file.
const LOGO_ASPECT = 6110 / 2202

// Macron bounding box, measured directly from celebre.PNG's own pixel data
// (bottom-up UV) — not a guess, so the macron animation targets the real
// artwork on this page too.
const MACRON_RECT: [number, number, number, number] = [0.7383, 0.8115, 0.1036, 0.0677]

export function CelebreHero() {
  return (
    <PremiumHero
      id="celebre-hero"
      logoSrc={celebreLogo}
      logoAlt="ELATŌ Celebré"
      logoAspect={LOGO_ASPECT}
      macronRect={MACRON_RECT}
      sectionName="Celebré"
      tagline={celebreHero.tagline}
      imageAlt="ELATŌ Celebré — handcrafted ice cream, artisan coffee and signature desserts"
      imageSrc={celebreHeroImage}
      cardStatLabel="Menu Categories"
      cardStatValue={String(categories.length)}
      cardBadgeLabel="A Local Favorite"
    />
  )
}
