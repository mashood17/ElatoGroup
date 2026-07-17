import { Seo } from '../components/Seo'
import { eventVenueJsonLd } from '../lib/jsonLd'
import { EventsHero } from '../components/events/EventsHero'
import { EventExperience } from '../components/events/EventExperience'
import { EventsGallery } from '../components/events/EventsGallery'
import { EventsEnquiry } from '../components/events/EventsEnquiry'

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
        <EventsHero />
        <EventExperience />
        <EventsGallery />
        <EventsEnquiry />
      </main>
    </>
  )
}
