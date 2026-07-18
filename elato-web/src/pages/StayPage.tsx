import { Seo } from '../components/Seo'
import { lodgingJsonLd } from '../lib/jsonLd'
import { StayHeroReveal } from '../components/stay/StayHeroReveal'
import { Amenities } from '../components/stay/Amenities'
import { StayGallery } from '../components/stay/StayGallery'
import { BookingEnquiry } from '../components/stay/BookingEnquiry'
import { StickyWhatsAppBar } from '../components/stay/StickyWhatsAppBar'

export function StayPage() {
  return (
    <>
      <Seo
        title="Elato Stay — 2BHK Premium Apartment"
        description="A spacious 2BHK premium serviced apartment for 6–8 guests in Panemangalore — for family trips, wedding guests, business travelers, and vacation stays."
        path="/elato-stay"
        jsonLd={lodgingJsonLd()}
      />
      <main>
        <StayHeroReveal />
        <Amenities />
        <StayGallery />
        <BookingEnquiry />
        <StickyWhatsAppBar />
      </main>
    </>
  )
}
