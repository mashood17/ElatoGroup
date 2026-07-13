import { StayHero } from '../components/stay/StayHero'
import { StayInfoStrip } from '../components/stay/StayInfoStrip'
import { StayIntroduction } from '../components/stay/StayIntroduction'
import { RoomDetails } from '../components/stay/RoomDetails'
import { Amenities } from '../components/stay/Amenities'
import { StayGallery } from '../components/stay/StayGallery'
import { HospitalityPromise } from '../components/stay/HospitalityPromise'
import { BookingEnquiry } from '../components/stay/BookingEnquiry'
import { StickyWhatsAppBar } from '../components/stay/StickyWhatsAppBar'

export function StayPage() {
  return (
    <main>
      <StayHero />
      <StayInfoStrip />
      <StayIntroduction />
      <RoomDetails />
      <Amenities />
      <StayGallery />
      <HospitalityPromise />
      <BookingEnquiry />
      <StickyWhatsAppBar />
    </main>
  )
}
