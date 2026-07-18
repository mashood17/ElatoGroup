import { PremiumHero } from '../hero/PremiumHero'
import { stayHero } from '../../content/stayContent'
import eventsStayLogo from '../../assets/logos/events_stay.webp'
import { serviceImages, serviceImageKeys } from '../../content/serviceImages'
import { useSiteImage } from '../../lib/useSiteImage'

// Real, client-confirmed capacity (see stayInfo in stayContent.ts) — not a
// made-up figure.
const STAY_CAPACITY_VALUE = '6–8'

// Real pixel dimensions of the shared Stay/Events wordmark artwork.
// events_stay.PNG was regenerated with margins matching elato-wordmark.png's
// proportions (the original file had the "Ō" flush against the canvas edge,
// which is what caused it to render clipped) — these values match the new
// file.
const LOGO_ASPECT = 3270 / 1124

// Macron bounding box, measured directly from events_stay.PNG's own pixel
// data (bottom-up UV) — not a guess, so the macron animation targets the
// real artwork on this page too.
const MACRON_RECT: [number, number, number, number] = [0.7373, 0.8105, 0.0988, 0.0676]

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
      logoAspect={LOGO_ASPECT}
      macronRect={MACRON_RECT}
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
