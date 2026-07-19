import { PremiumHero } from '../hero/PremiumHero'
import { celebreHero, categories } from '../../content/celebreContent'
import celebreLogo from '../../assets/logos/elato-logo-celebre.svg'
import { serviceImages, serviceImageKeys } from '../../content/serviceImages'
import { useSiteImage } from '../../lib/useSiteImage'

// Intrinsic dimensions from elato-logo-celebre.svg's own viewBox.
const LOGO_WIDTH = 1920
const LOGO_HEIGHT = 1080

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
      logoWidth={LOGO_WIDTH}
      logoHeight={LOGO_HEIGHT}
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
