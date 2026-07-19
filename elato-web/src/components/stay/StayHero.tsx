import { PremiumHero } from '../hero/PremiumHero'
import { stayHero } from '../../content/stayContent'
import eventsStayLogo from '../../assets/logos/elato-logo-stay-event.svg'
import { serviceImages, serviceImageKeys } from '../../content/serviceImages'
import { useSiteImage } from '../../lib/useSiteImage'

// Real, client-confirmed capacity (see stayInfo in stayContent.ts) — not a
// made-up figure.
const STAY_CAPACITY_VALUE = '6–8'

// Intrinsic dimensions from elato-logo-stay-event.svg's own viewBox.
const LOGO_WIDTH = 545
const LOGO_HEIGHT = 185

export function StayHero() {
  // Same site_content key the "Discover ELATŌ" Stay card reads
  // (`Services.tsx`) — one shared image, so the shared-element transition
  // never has to swap it for a different photo on arrival.
  const imageSrc = useSiteImage(serviceImageKeys.stay, serviceImages.stay)
  return (
    <PremiumHero
      id="stay-hero"
      logoSrc={eventsStayLogo}
      logoAlt="ELATŌ Events & Stay"
      logoWidth={LOGO_WIDTH}
      logoHeight={LOGO_HEIGHT}
      sectionName="Stay"
      tagline={stayHero.tagline}
      imageAlt="ELATŌ Stay — the premium serviced apartment building"
      imageSrc={imageSrc}
      cardStatLabel="Guest Capacity"
      cardStatValue={STAY_CAPACITY_VALUE}
      cardBadgeLabel="Loved By Guests"
    />
  )
}
