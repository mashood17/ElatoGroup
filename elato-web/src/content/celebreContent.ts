/**
 * Placeholder content for the Celebré page (`/elato-celebre`).
 *
 * These arrays are the ONLY place placeholder data lives. Every component
 * reads through `src/lib/menuRepository.ts` instead of importing these
 * directly, so swapping in real Supabase queries later means replacing the
 * repository's internals, not touching a single component.
 */

export type Category = {
  id: string
  name: string
  slug: string
  description: string
  sortOrder: number
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
}

export type Special = {
  id: string
  name: string
  description: string
  price: number
}

export const categories: Category[] = [
  { id: 'cat-ice-cream', name: 'Special Ice Creams', slug: 'ice-creams', description: 'Small-batch, churned in-house — never a shortcut flavor.', sortOrder: 0 },
  { id: 'cat-fries-sandwiches', name: 'Fries & Sandwiches', slug: 'fries-sandwiches', description: 'Savory counterpoints to the sweeter side of the menu.', sortOrder: 1 },
  { id: 'cat-cakes', name: 'Cakes', slug: 'cakes', description: 'Sliced to order, from whole cakes baked each morning.', sortOrder: 2 },
  { id: 'cat-shakes', name: 'Thick Shakes', slug: 'thick-shakes', description: 'Dense, cold, and unhurried — built to be finished slowly.', sortOrder: 3 },
  { id: 'cat-mojitos', name: 'Mojitos', slug: 'mojitos', description: 'Virgin mojitos, muddled fresh at order time.', sortOrder: 4 },
  { id: 'cat-burgers-pizza', name: 'Burgers & Pizza', slug: 'burgers-pizza', description: 'For the table that wants a savory course before dessert.', sortOrder: 5 },
] // PLACEHOLDER — PRD-style categories table

export const menuItems: MenuItem[] = [
  // Special Ice Creams
  { id: 'item-belgian-choc-sundae', categoryId: 'cat-ice-cream', name: 'Belgian Chocolate Sundae', description: 'Belgian dark chocolate, vanilla bean ice cream, toasted almonds.', price: 320, isVeg: true, deliveryAvailable: true, sortOrder: 0 },
  { id: 'item-salted-caramel-swirl', categoryId: 'cat-ice-cream', name: 'Salted Caramel Swirl', description: 'House-made salted caramel folded through vanilla ice cream.', price: 280, isVeg: true, deliveryAvailable: true, sortOrder: 1 },
  { id: 'item-pistachio-rose', categoryId: 'cat-ice-cream', name: 'Pistachio Rose', description: 'Roasted pistachio ice cream with a whisper of rose water.', price: 300, isVeg: true, deliveryAvailable: true, sortOrder: 2 },
  { id: 'item-seasonal-fruit-medley', categoryId: 'cat-ice-cream', name: 'Seasonal Fruit Medley', description: "Whatever's ripest this week, over a light sorbet base.", price: 260, isVeg: true, deliveryAvailable: false, sortOrder: 3 },

  // Fries & Sandwiches
  { id: 'item-truffle-parmesan-fries', categoryId: 'cat-fries-sandwiches', name: 'Truffle Parmesan Fries', description: 'Hand-cut fries, truffle oil, shaved parmesan.', price: 240, isVeg: true, deliveryAvailable: true, sortOrder: 0 },
  { id: 'item-peri-peri-fries', categoryId: 'cat-fries-sandwiches', name: 'Classic Peri Peri Fries', description: 'A sharper, spiced take on the classic.', price: 200, isVeg: true, deliveryAvailable: true, sortOrder: 1 },
  { id: 'item-grilled-veg-sandwich', categoryId: 'cat-fries-sandwiches', name: 'Grilled Vegetable Sandwich', description: 'Char-grilled seasonal vegetables, herbed mayo, sourdough.', price: 220, isVeg: true, deliveryAvailable: true, sortOrder: 2 },
  { id: 'item-smoked-chicken-sandwich', categoryId: 'cat-fries-sandwiches', name: 'Smoked Chicken Sandwich', description: 'Slow-smoked chicken, pickled onion, sourdough.', price: 260, isVeg: false, deliveryAvailable: true, sortOrder: 3 },

  // Cakes
  { id: 'item-dark-choc-truffle-slice', categoryId: 'cat-cakes', name: 'Dark Chocolate Truffle Slice', description: 'A dense, ganache-layered slice for the serious chocolate guest.', price: 220, isVeg: true, deliveryAvailable: true, sortOrder: 0 },
  { id: 'item-red-velvet-slice', categoryId: 'cat-cakes', name: 'Red Velvet Slice', description: 'Cream cheese frosting, a lighter crumb than most.', price: 210, isVeg: true, deliveryAvailable: true, sortOrder: 1 },
  { id: 'item-classic-cheesecake-slice', categoryId: 'cat-cakes', name: 'Classic Cheesecake Slice', description: 'Baked, not set — a slower, richer method.', price: 240, isVeg: true, deliveryAvailable: true, sortOrder: 2 },
  { id: 'item-seasonal-berry-tart', categoryId: 'cat-cakes', name: 'Seasonal Berry Tart', description: 'Almond frangipane, glazed seasonal berries.', price: 250, isVeg: true, deliveryAvailable: true, sortOrder: 3 },

  // Thick Shakes
  { id: 'item-belgian-choc-shake', categoryId: 'cat-shakes', name: 'Belgian Chocolate Shake', description: 'Made with the same chocolate as the sundae — dense, cold.', price: 220, isVeg: true, deliveryAvailable: true, sortOrder: 0 },
  { id: 'item-cookies-cream-shake', categoryId: 'cat-shakes', name: 'Cookies & Cream Shake', description: 'A steady, unfussy favourite.', price: 210, isVeg: true, deliveryAvailable: true, sortOrder: 1 },
  { id: 'item-mango-delight-shake', categoryId: 'cat-shakes', name: 'Mango Delight Shake', description: 'Seasonal mango, blended thick.', price: 200, isVeg: true, deliveryAvailable: true, sortOrder: 2 },
  { id: 'item-salted-caramel-shake', categoryId: 'cat-shakes', name: 'Salted Caramel Shake', description: 'The sundae’s caramel, reworked into a shake.', price: 230, isVeg: true, deliveryAvailable: true, sortOrder: 3 },

  // Mojitos
  { id: 'item-classic-virgin-mojito', categoryId: 'cat-mojitos', name: 'Classic Virgin Mojito', description: 'Mint, lime, soda — muddled at order time.', price: 180, isVeg: true, deliveryAvailable: true, sortOrder: 0 },
  { id: 'item-blue-lagoon-mojito', categoryId: 'cat-mojitos', name: 'Blue Lagoon Mojito', description: 'A cooler, blue-curaçao-syrup take on the classic.', price: 190, isVeg: true, deliveryAvailable: true, sortOrder: 1 },
  { id: 'item-watermelon-mint-mojito', categoryId: 'cat-mojitos', name: 'Watermelon Mint Mojito', description: 'Fresh watermelon juice, mint, lime.', price: 190, isVeg: true, deliveryAvailable: true, sortOrder: 2 },
  { id: 'item-passionfruit-mojito', categoryId: 'cat-mojitos', name: 'Passionfruit Mojito', description: 'Tart passionfruit against sharp mint.', price: 200, isVeg: true, deliveryAvailable: true, sortOrder: 3 },

  // Burgers & Pizza
  { id: 'item-classic-veg-burger', categoryId: 'cat-burgers-pizza', name: 'Classic Veg Burger', description: 'House patty, cheddar, burger sauce.', price: 240, isVeg: true, deliveryAvailable: true, sortOrder: 0 },
  { id: 'item-smoked-chicken-burger', categoryId: 'cat-burgers-pizza', name: 'Smoked Chicken Burger', description: 'The sandwich’s smoked chicken, on a brioche bun.', price: 280, isVeg: false, deliveryAvailable: true, sortOrder: 1 },
  { id: 'item-margherita-pizza', categoryId: 'cat-burgers-pizza', name: 'Margherita Pizza', description: 'San Marzano tomato, fior di latte, basil.', price: 320, isVeg: true, deliveryAvailable: true, sortOrder: 2 },
  { id: 'item-farmhouse-pizza', categoryId: 'cat-burgers-pizza', name: 'Farmhouse Pizza', description: 'A fuller, vegetable-forward topping set.', price: 350, isVeg: true, deliveryAvailable: true, sortOrder: 3 },
] // PLACEHOLDER — PRD-style menu_items table

export const specials: Special[] = [
  { id: 'sp-celebration-tower', name: 'Celebration Sundae Tower', description: 'A three-tier sundae built for the table to share.', price: 890 },
  { id: 'sp-anniversary-duo', name: 'Anniversary Cake Duo', description: 'Two signature slices, plated for two.', price: 420 },
  { id: 'sp-monsoon-waffle', name: 'Monsoon Special Waffle', description: 'Warm waffle, seasonal compote, vanilla ice cream.', price: 340 },
  { id: 'sp-birthday-box', name: 'Birthday Surprise Box', description: 'A curated box of miniatures, for the table to open together.', price: 650 },
  { id: 'sp-chocolate-fondue', name: 'Chocolate Fondue for Two', description: 'Warm dark chocolate, seasonal fruit, marshmallow.', price: 480 },
  { id: 'sp-weekend-brunch', name: 'Weekend Brunch Platter', description: 'A quieter, savory-and-sweet mid-morning course.', price: 560 },
  { id: 'sp-kids-combo', name: 'Kids Ice Cream Combo', description: 'Two scoops, a cookie, and a small surprise.', price: 220 },
  { id: 'sp-festive-jar', name: 'Festive Cake Jar', description: 'Layered cake in a jar, for taking the celebration home.', price: 260 },
  { id: 'sp-mango-season', name: 'Mango Season Special', description: 'A limited-run mango dessert, while the season lasts.', price: 310 },
  { id: 'sp-date-night', name: 'Date Night Dessert Platter', description: 'A small plated selection, built for two.', price: 590 },
  { id: 'sp-corporate-box', name: 'Corporate Treat Box', description: 'A neat, shareable box for small office celebrations.', price: 720 },
  { id: 'sp-midnight-combo', name: 'Midnight Craving Combo', description: 'A shake and a slice, for the late-evening order.', price: 380 },
] // PLACEHOLDER — 10–12 featured specials, independent from the core menu (PRD Ch. 14)
