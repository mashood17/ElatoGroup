import { PremiumHero } from '../hero/PremiumHero'
import { eventsHero, EVENTS_HALL_CAPACITY_MIN, EVENTS_HALL_CAPACITY_MAX } from '../../content/eventsContent'
import eventsStayLogo from '../../assets/logos/elato-logo-stay-event.svg'
import { serviceImages, serviceImageKeys } from '../../content/serviceImages'
import { useSiteImage } from '../../lib/useSiteImage'

// Intrinsic dimensions from elato-logo-stay-event.svg's own viewBox.
const LOGO_WIDTH = 545
const LOGO_HEIGHT = 185

export function EventsHero() {
  // Same site_content key the "Discover ELATŌ" Events card reads
  // (`Services.tsx`) — one shared image, so the shared-element transition
  // never has to swap it for a different photo on arrival.
  const imageSrc = useSiteImage(serviceImageKeys.events, serviceImages.events)
  return (
    <PremiumHero
      id="events-hero"
      logoSrc={eventsStayLogo}
      logoAlt="ELATŌ Events & Stay"
      logoWidth={LOGO_WIDTH}
      logoHeight={LOGO_HEIGHT}
      sectionName="Events"
      tagline={eventsHero.tagline}
      imageAlt="ELATŌ Events — the banquet hall, set up for a celebration"
      imageSrc={imageSrc}
      cardStatLabel="Hall Capacity"
      cardStatValue={`${EVENTS_HALL_CAPACITY_MIN}–${EVENTS_HALL_CAPACITY_MAX}`}
      cardBadgeLabel="Celebrated Here"
    />
  )
}
