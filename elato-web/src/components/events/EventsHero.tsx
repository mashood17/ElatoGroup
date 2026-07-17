import { PremiumHero } from '../hero/PremiumHero'
import { eventsHero, EVENTS_HALL_CAPACITY_MIN, EVENTS_HALL_CAPACITY_MAX } from '../../content/eventsContent'
import eventsStayLogo from '../../assets/logos/events_stay.PNG'
import eventsHeroImage from '../../assets/services/events.png'
import { useSiteImage } from '../../lib/useSiteImage'

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

export function EventsHero() {
  const imageSrc = useSiteImage('events_hero_image', eventsHeroImage)
  return (
    <PremiumHero
      id="events-hero"
      logoSrc={eventsStayLogo}
      logoAlt="ELATŌ Events & Stay"
      logoAspect={LOGO_ASPECT}
      macronRect={MACRON_RECT}
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
