import { Seo } from '../components/Seo'
import { lodgingJsonLd } from '../lib/jsonLd'
import { StayHero } from '../components/stay/StayHero'
import { StayIntroduction } from '../components/stay/StayIntroduction'
import { Amenities } from '../components/stay/Amenities'
import { StayGallery } from '../components/stay/StayGallery'
import { HospitalityPromise } from '../components/stay/HospitalityPromise'
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
        <StayHero />
        <StayIntroduction />
        <Amenities />
        <StayGallery />
        <HospitalityPromise />
        <BookingEnquiry />
        <StickyWhatsAppBar />
      </main>
    </>
  )
}
