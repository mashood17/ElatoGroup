/**
 * Content for the Celebré page (`/elato-celebre`).
 *
 * Categories below are REAL (client-confirmed menu categories). Individual
 * item names/descriptions/prices are still placeholders pending the actual
 * price list — clearly marked so they're not mistaken for real menu data.
 *
 * These arrays are the ONLY place content data lives. Every component reads
 * through `src/lib/menuRepository.ts` instead of importing these directly,
 * so swapping in real Supabase queries later means replacing the
 * repository's internals, not touching a single component.
 */

export const celebreHero = {
  tagline: 'Handcrafted Ice Cream, Artisan Coffee & Signature Desserts',
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string
  sortOrder: number
  /** Admin-managed image (optimized Supabase URL). Null when none uploaded. */
  imageUrl?: string | null
}

export type MenuItem = {
  id: string
  categoryId: string
  name: string
  description: string
  price: number
  isVeg: boolean
  deliveryAvailable: boolean
  sortOrder: number
  /** Admin-managed image (optimized Supabase URL). Null when none uploaded. */
  imageUrl?: string | null
}

export type Special = {
  id: string
  name: string
  description: string
  price: number
  /** Admin-managed image (optimized Supabase URL). Null when none uploaded. */
  imageUrl?: string | null
}

export const categories: Category[] = [
  { id: 'cat-ice-cream', name: 'Premium Ice Creams', slug: 'premium-ice-creams', description: 'Small-batch, churned in-house — never a shortcut flavor.', sortOrder: 0 },
  { id: 'cat-coffee', name: 'Artisan Coffee', slug: 'artisan-coffee', description: 'Slow-brewed, considered coffee to open or close a visit.', sortOrder: 1 },
  { id: 'cat-mocktails', name: 'Signature Mocktails', slug: 'signature-mocktails', description: 'House mocktails, muddled fresh at order time.', sortOrder: 2 },
  { id: 'cat-shakes', name: 'Luxury Shakes', slug: 'luxury-shakes', description: 'Dense, cold, and unhurried — built to be finished slowly.', sortOrder: 3 },
  { id: 'cat-sundaes', name: 'Sundaes', slug: 'sundaes', description: 'Layered, composed, and built for sharing.', sortOrder: 4 },
  { id: 'cat-waffles', name: 'Waffles', slug: 'waffles', description: 'Warm, plated to order, never pre-made.', sortOrder: 5 },
  { id: 'cat-brownies', name: 'Brownies', slug: 'brownies', description: 'Dense-baked, served warm on request.', sortOrder: 6 },
  { id: 'cat-falooda', name: 'Falooda', slug: 'falooda', description: 'A classic done properly — no shortcuts on the layers.', sortOrder: 7 },
  { id: 'cat-juices', name: 'Fresh Juices', slug: 'fresh-juices', description: 'Pressed to order, nothing from concentrate.', sortOrder: 8 },
  { id: 'cat-desserts', name: 'Premium Desserts', slug: 'premium-desserts', description: 'The plated finish for a table that wants one more course.', sortOrder: 9 },
] // REAL — client-confirmed menu categories

export const menuItems: MenuItem[] = [
  // Premium Ice Creams
  { id: 'item-belgian-choc', categoryId: 'cat-ice-cream', name: 'Belgian Chocolate', description: 'Belgian dark chocolate, churned in-house.', price: 180, isVeg: true, deliveryAvailable: true, sortOrder: 0 },
  { id: 'item-pistachio', categoryId: 'cat-ice-cream', name: 'Roasted Pistachio', description: 'Roasted pistachio, lightly sweetened.', price: 190, isVeg: true, deliveryAvailable: true, sortOrder: 1 },
  { id: 'item-seasonal-fruit', categoryId: 'cat-ice-cream', name: 'Seasonal Fruit', description: "Whatever's ripest this week.", price: 170, isVeg: true, deliveryAvailable: true, sortOrder: 2 },

  // Artisan Coffee
  { id: 'item-espresso', categoryId: 'cat-coffee', name: 'Signature Espresso', description: 'A slow-pulled double shot.', price: 120, isVeg: true, deliveryAvailable: true, sortOrder: 0 },
  { id: 'item-cold-brew', categoryId: 'cat-coffee', name: 'House Cold Brew', description: 'Steeped 18 hours, served over ice.', price: 150, isVeg: true, deliveryAvailable: true, sortOrder: 1 },
  { id: 'item-cappuccino', categoryId: 'cat-coffee', name: 'Cappuccino', description: 'Classic ratio, microfoam finish.', price: 140, isVeg: true, deliveryAvailable: true, sortOrder: 2 },

  // Signature Mocktails
  { id: 'item-virgin-mojito', categoryId: 'cat-mocktails', name: 'Classic Virgin Mojito', description: 'Mint, lime, soda — muddled at order time.', price: 180, isVeg: true, deliveryAvailable: true, sortOrder: 0 },
  { id: 'item-passionfruit-mocktail', categoryId: 'cat-mocktails', name: 'Passionfruit Cooler', description: 'Tart passionfruit against sharp mint.', price: 200, isVeg: true, deliveryAvailable: true, sortOrder: 1 },
  { id: 'item-watermelon-mocktail', categoryId: 'cat-mocktails', name: 'Watermelon Mint', description: 'Fresh watermelon juice, mint, lime.', price: 190, isVeg: true, deliveryAvailable: true, sortOrder: 2 },

  // Luxury Shakes
  { id: 'item-belgian-shake', categoryId: 'cat-shakes', name: 'Belgian Chocolate Shake', description: 'Made with the same chocolate as the ice cream.', price: 220, isVeg: true, deliveryAvailable: true, sortOrder: 0 },
  { id: 'item-caramel-shake', categoryId: 'cat-shakes', name: 'Salted Caramel Shake', description: 'House-made salted caramel, blended thick.', price: 230, isVeg: true, deliveryAvailable: true, sortOrder: 1 },
  { id: 'item-cookies-cream-shake', categoryId: 'cat-shakes', name: 'Cookies & Cream Shake', description: 'A steady, unfussy favourite.', price: 210, isVeg: true, deliveryAvailable: true, sortOrder: 2 },

  // Sundaes
  { id: 'item-classic-sundae', categoryId: 'cat-sundaes', name: 'Classic Belgian Sundae', description: 'Belgian chocolate, vanilla, toasted almonds.', price: 280, isVeg: true, deliveryAvailable: true, sortOrder: 0 },
  { id: 'item-caramel-sundae', categoryId: 'cat-sundaes', name: 'Salted Caramel Swirl', description: 'House caramel folded through vanilla.', price: 270, isVeg: true, deliveryAvailable: true, sortOrder: 1 },

  // Waffles
  { id: 'item-classic-waffle', categoryId: 'cat-waffles', name: 'Classic Belgian Waffle', description: 'Warm waffle, seasonal compote, vanilla ice cream.', price: 250, isVeg: true, deliveryAvailable: true, sortOrder: 0 },
  { id: 'item-choc-waffle', categoryId: 'cat-waffles', name: 'Chocolate Hazelnut Waffle', description: 'Warm waffle, hazelnut spread, toasted nuts.', price: 270, isVeg: true, deliveryAvailable: true, sortOrder: 1 },

  // Brownies
  { id: 'item-classic-brownie', categoryId: 'cat-brownies', name: 'Dark Chocolate Brownie', description: 'Dense-baked, served warm.', price: 160, isVeg: true, deliveryAvailable: true, sortOrder: 0 },
  { id: 'item-brownie-ice-cream', categoryId: 'cat-brownies', name: 'Brownie with Ice Cream', description: 'Warm brownie, a scoop on top.', price: 220, isVeg: true, deliveryAvailable: true, sortOrder: 1 },

  // Falooda
  { id: 'item-classic-falooda', categoryId: 'cat-falooda', name: 'Classic Falooda', description: 'Rose syrup, vermicelli, basil seeds, ice cream.', price: 200, isVeg: true, deliveryAvailable: true, sortOrder: 0 },
  { id: 'item-mango-falooda', categoryId: 'cat-falooda', name: 'Mango Falooda', description: 'Seasonal mango, layered the classic way.', price: 220, isVeg: true, deliveryAvailable: false, sortOrder: 1 },

  // Fresh Juices
  { id: 'item-orange-juice', categoryId: 'cat-juices', name: 'Fresh Orange Juice', description: 'Pressed to order.', price: 130, isVeg: true, deliveryAvailable: true, sortOrder: 0 },
  { id: 'item-mixed-fruit-juice', categoryId: 'cat-juices', name: 'Mixed Fruit Juice', description: 'A seasonal blend, pressed fresh.', price: 140, isVeg: true, deliveryAvailable: true, sortOrder: 1 },

  // Premium Desserts
  { id: 'item-cheesecake', categoryId: 'cat-desserts', name: 'Classic Cheesecake Slice', description: 'Baked, not set — a slower, richer method.', price: 240, isVeg: true, deliveryAvailable: true, sortOrder: 0 },
  { id: 'item-tiramisu', categoryId: 'cat-desserts', name: 'Tiramisu', description: 'Espresso-soaked, layered to order.', price: 260, isVeg: true, deliveryAvailable: true, sortOrder: 1 },
] // PLACEHOLDER items within REAL categories — exact price list pending from client

export const specials: Special[] = [
  { id: 'sp-celebration-tower', name: 'Celebration Sundae Tower', description: 'A three-tier sundae built for the table to share.', price: 890 },
  { id: 'sp-anniversary-duo', name: 'Anniversary Dessert Duo', description: 'Two signature desserts, plated for two.', price: 420 },
  { id: 'sp-monsoon-waffle', name: 'Monsoon Special Waffle', description: 'Warm waffle, seasonal compote, vanilla ice cream.', price: 340 },
  { id: 'sp-birthday-box', name: 'Birthday Surprise Box', description: 'A curated box of miniatures, for the table to open together.', price: 650 },
  { id: 'sp-chocolate-fondue', name: 'Chocolate Fondue for Two', description: 'Warm dark chocolate, seasonal fruit, marshmallow.', price: 480 },
  { id: 'sp-weekend-brunch', name: 'Weekend Brunch Platter', description: 'A quieter, savory-and-sweet mid-morning course.', price: 560 },
  { id: 'sp-kids-combo', name: 'Kids Ice Cream Combo', description: 'Two scoops, a cookie, and a small surprise.', price: 220 },
  { id: 'sp-festive-jar', name: 'Festive Dessert Jar', description: 'Layered dessert in a jar, for taking the celebration home.', price: 260 },
  { id: 'sp-mango-season', name: 'Mango Season Special', description: 'A limited-run mango dessert, while the season lasts.', price: 310 },
  { id: 'sp-date-night', name: 'Date Night Dessert Platter', description: 'A small plated selection, built for two.', price: 590 },
  { id: 'sp-corporate-box', name: 'Corporate Treat Box', description: 'A neat, shareable box for small office celebrations.', price: 720 },
  { id: 'sp-midnight-combo', name: 'Midnight Craving Combo', description: 'A shake and a slice, for the late-evening order.', price: 380 },
] // PLACEHOLDER — 12 featured specials, independent from the core menu
