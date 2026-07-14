import { PremiumHero } from '../hero/PremiumHero'
import { stayHero } from '../../content/stayContent'
import eventsStayLogo from '../../assets/logos/events_stay.PNG'

// Real pixel dimensions of the shared Stay/Events wordmark artwork.
const LOGO_ASPECT = 29999 / 9823

// Macron bounding box, measured directly from events_stay.PNG's own pixel
// data (bottom-up UV) — not a guess, so the macron animation targets the
// real artwork on this page too.
const MACRON_RECT: [number, number, number, number] = [0.8254, 0.9113, 0.1326, 0.0949]

export function StayHero() {
  return (
    <PremiumHero
      id="stay-hero"
      logoSrc={eventsStayLogo}
      logoAlt="ELATŌ Events & Stay"
      logoAspect={LOGO_ASPECT}
      macronRect={MACRON_RECT}
      tagline={stayHero.tagline}
    />
  )
}
