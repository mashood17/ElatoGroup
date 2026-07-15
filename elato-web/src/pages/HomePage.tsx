import { Seo } from '../components/Seo'
import { localBusinessJsonLd, organizationJsonLd } from '../lib/jsonLd'
import { HeroServicesReveal } from '../components/sections/HeroServicesReveal'
import { About } from '../components/sections/About'
import { InstagramSection } from '../components/sections/InstagramSection'
import { ReviewsSection } from '../components/sections/ReviewsSection'
import { VisitSection } from '../components/sections/VisitSection'

export function HomePage() {
  return (
    <>
      <Seo
        title="Where Every Celebration Begins"
        description="ELATŌ — a premium lifestyle destination in Panemangalore combining handcrafted desserts, artisan coffee, an event hall, and a boutique stay."
        path="/"
        jsonLd={[localBusinessJsonLd(), organizationJsonLd()]}
      />
      <main>
        <HeroServicesReveal />
        <About />
        <InstagramSection />
        <ReviewsSection />
        <VisitSection />
      </main>
    </>
  )
}
