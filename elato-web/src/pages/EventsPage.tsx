import { EventsHero } from '../components/events/EventsHero'
import { FeaturedEvents } from '../components/events/FeaturedEvents'
import { EventExperience } from '../components/events/EventExperience'
import { EventsQuote } from '../components/events/EventsQuote'
import { EventsEnquiry } from '../components/events/EventsEnquiry'

export function EventsPage() {
  return (
    <main>
      <EventsHero />
      <FeaturedEvents />
      <EventExperience />
      <EventsQuote />
      <EventsEnquiry />
    </main>
  )
}
