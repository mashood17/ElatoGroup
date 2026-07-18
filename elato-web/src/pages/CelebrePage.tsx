import { Seo } from '../components/Seo'
import { restaurantJsonLd } from '../lib/jsonLd'
import { BasketProvider } from '../lib/basketContext'
import { CelebreHeroReveal } from '../components/celebre/CelebreHeroReveal'
import { PartyFacilities } from '../components/celebre/PartyFacilities'
import { MenuSection } from '../components/celebre/MenuSection'
import { DeliveryBasket } from '../components/celebre/DeliveryBasket'

export function CelebrePage() {
  return (
    <BasketProvider>
      <Seo
        title="Elato Celebré — Café & Desserts"
        description="Handcrafted ice cream, artisan coffee, signature mocktails, and premium desserts at ELATŌ Celebré in Panemangalore. Order on WhatsApp."
        path="/elato-celebre"
        jsonLd={restaurantJsonLd()}
      />
      <main>
        <CelebreHeroReveal />
        <PartyFacilities />
        <MenuSection />
        <DeliveryBasket />
      </main>
    </BasketProvider>
  )
}
