import { BasketProvider } from '../lib/basketContext'
import { CelebreHero } from '../components/celebre/CelebreHero'
import { FeaturedSpecials } from '../components/celebre/FeaturedSpecials'
import { Craftsmanship } from '../components/celebre/Craftsmanship'
import { PartyFacilities } from '../components/celebre/PartyFacilities'
import { MenuSection } from '../components/celebre/MenuSection'
import { DeliveryBasket } from '../components/celebre/DeliveryBasket'

export function CelebrePage() {
  return (
    <BasketProvider>
      <main>
        <CelebreHero />
        <FeaturedSpecials />
        <Craftsmanship />
        <PartyFacilities />
        <MenuSection />
        <DeliveryBasket />
      </main>
    </BasketProvider>
  )
}
