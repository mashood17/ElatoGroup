import { Seo } from '../components/Seo'
import { localBusinessJsonLd, organizationJsonLd } from '../lib/jsonLd'
import { Hero } from '../components/sections/Hero'
import { Services } from '../components/sections/Services'
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
        <Hero />
        <Services />
        <About />
        <InstagramSection />
        <ReviewsSection />
        <VisitSection />
      </main>
    </>
  )
}
