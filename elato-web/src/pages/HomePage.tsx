import { Hero } from '../components/sections/Hero'
import { Services } from '../components/sections/Services'
import { About } from '../components/sections/About'
import { InstagramSection } from '../components/sections/InstagramSection'
import { ReviewsSection } from '../components/sections/ReviewsSection'
import { VisitSection } from '../components/sections/VisitSection'

export function HomePage() {
  return (
    <main>
      <Hero />
      <Services />
      <About />
      <InstagramSection />
      <ReviewsSection />
      <VisitSection />
    </main>
  )
}
