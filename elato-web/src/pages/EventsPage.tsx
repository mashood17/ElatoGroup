import { Seo } from '../components/Seo'
import { eventVenueJsonLd } from '../lib/jsonLd'
import { EventsHero } from '../components/events/EventsHero'
import { EventsCapacity } from '../components/events/EventsCapacity'
import { FeaturedEvents } from '../components/events/FeaturedEvents'
import { EventExperience } from '../components/events/EventExperience'
import { EventsGallery } from '../components/events/EventsGallery'
import { EventsQuote } from '../components/events/EventsQuote'
import { EventsEnquiry } from '../components/events/EventsEnquiry'
import { PinnedHeroReveal } from '../components/sections/PinnedHeroReveal'

export function EventsPage() {
  return (
    <>
      <Seo
        title="Elato Events — Weddings & Celebrations Hall"
        description="A 200–250 guest hall in Panemangalore for weddings, engagements, birthdays, naming ceremonies, corporate events, and family gatherings."
        path="/elato-events"
        jsonLd={eventVenueJsonLd()}
      />
      <main>
        <PinnedHeroReveal hero={<EventsHero />} next={<FeaturedEvents />} />
        <EventsCapacity />
        <EventExperience />
        <EventsGallery />
        <EventsQuote />
        <EventsEnquiry />
      </main>
    </>
  )
}
