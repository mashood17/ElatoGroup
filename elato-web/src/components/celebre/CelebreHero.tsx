import { PremiumHero } from '../hero/PremiumHero'
import { celebreHero, categories } from '../../content/celebreContent'
import celebreLogo from '../../assets/logos/celebre.webp'
import { serviceImages, serviceImageKeys } from '../../content/serviceImages'
import { useSiteImage } from '../../lib/useSiteImage'

// Real pixel dimensions of the Celebré wordmark artwork (celebre.webp is a
// performance-only re-encode of the original 6110x2202 celebre.PNG, downscaled
// to 3000x1081 — a wordmark never renders past ~800 CSS px even at 3x DPR, so
// the original was an oversized GPU texture; this ratio matches the new file
// almost exactly, within sub-pixel rounding).
const LOGO_ASPECT = 3000 / 1081

// Macron bounding box, measured directly from celebre.PNG's own pixel data
// (bottom-up UV) — not a guess, so the macron animation targets the real
// artwork on this page too.
const MACRON_RECT: [number, number, number, number] = [0.7383, 0.8115, 0.1036, 0.0677]

export function CelebreHero() {
  // Same site_content key the "Discover ELATŌ" Celebré card reads
  // (`Services.tsx`) — one shared image, so the shared-element transition
  // never has to swap it for a different photo on arrival.
  const imageSrc = useSiteImage(serviceImageKeys.celebre, serviceImages.celebre)
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
      imageSrc={imageSrc}
      cardStatLabel="Menu Categories"
      cardStatValue={String(categories.length)}
      cardBadgeLabel="A Local Favorite"
    />
  )
}
