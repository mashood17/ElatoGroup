/**
 * Site content for the Homepage. Business info below is REAL, supplied by
 * the client (project charter, Section 3) — not a placeholder. Instagram
 * feed items, reviews, and aggregate rating remain placeholders pending a
 * live Instagram Graph API / Google Places integration (Phase 8).
 *
 * Shaped like the future API responses (site_content, instagram_cache,
 * google_reviews_cache) so wiring a real Supabase/FastAPI backend later is a
 * data-source swap, not a rewrite.
 */

export const businessInfo = {
  address: 'Near Mandovi Motors, Melkar, Panemangalore, Bantwal, Karnataka 574231',
  phone: '+91 97314 00313',
  whatsappNumber: '919731400313', // E.164 digits only, for wa.me links
  email: 'elatogroups@gmail.com',
  instagramHandle: '@elato.in',
  instagramUrl: 'https://instagram.com/elato.in',
  googleReviewsUrl: 'https://www.google.com/maps/search/?api=1&query=ELAT%C5%8C+CELEBR%C3%89+Panemangalore',
  // Clean canonical listing path — tracking/session query params intentionally stripped.
  bookingComUrl: 'https://www.booking.com/hotel/in/elato-events-amp-stay.en-gb.html',
  hours: [
    { day: 'Daily', time: 'Hours to be confirmed' }, // PLACEHOLDER — real hours not yet supplied
  ],
} as const

export const heroContent = {
  overline: 'ELATŌ',
  headline: 'Where Every Celebration Begins',
  subStatement: 'Premium Ice Cream • Café • Events • Stay',
  ctaLabel: 'Discover Elato',
}

export const servicesContent = [
  {
    id: 'celebre',
    title: 'Elato Celebré',
    descriptor: 'Handcrafted ice cream, artisan coffee, and signature desserts.',
  },
  {
    id: 'stay',
    title: 'Elato Stay',
    descriptor: 'A spacious 2BHK premium serviced apartment for 6–8 guests.',
  },
  {
    id: 'events',
    title: 'Elato Events',
    descriptor: 'A 200–250 guest hall for weddings, engagements, and celebrations.',
  },
] as const

export const servicesHeading = {
  overline: 'Signature Experiences',
  title: 'Discover ELATŌ',
  description:
    'Three distinctive experiences brought together by one commitment to exceptional hospitality.',
}

export const aboutContent = {
  overline: 'About ELATŌ',
  title: 'Where Every Celebration Begins',
  paragraphs: [
    'ELATŌ was founded with one vision — to create a destination where families, friends, and guests can celebrate life’s special moments in a premium environment.',
    'Backed by more than 30 years of expertise in the ice cream industry through founder Abdul Hakeem, ELATŌ combines traditional craftsmanship with modern hospitality.',
    'From handcrafted ice creams and signature beverages to elegant event spaces and premium stays, every detail reflects our commitment to excellence.',
    'Whether you’re here for dessert, a family gathering, a birthday celebration, or a weekend stay, ELATŌ offers experiences designed to create lasting memories.',
  ],
  ctaLabel: 'Discover Our Story',
}

export const founder = {
  name: 'Abdul Hakeem',
  bio: '30+ years in the ice cream industry.',
}

export const vision =
  "To become Karnataka's most loved premium destination for desserts, celebrations, and hospitality while creating unforgettable experiences for every guest."

export const mission = [
  'Deliver premium quality in everything we serve.',
  'Create memorable celebrations.',
  'Build lasting customer relationships.',
  'Continuously innovate our offerings.',
  'Set new standards in hospitality.',
]

export const values = [
  'Excellence',
  'Quality',
  'Hospitality',
  'Integrity',
  'Innovation',
  'Passion',
  'Customer Happiness',
]

export const whyChooseElato = [
  'Premium Quality',
  'Elegant Ambience',
  'Family Friendly',
  'Exceptional Hospitality',
  'Experienced Team',
  'Handcrafted Products',
  'Modern Facilities',
  'Memorable Celebrations',
  'Customer First Approach',
]

export const galleryCategories = [
  'Premium Café',
  'Signature Desserts',
  'Luxury Drinks',
  'Celebration Hall',
  'Events',
  'Stay',
  'Happy Guests',
  'Behind the Scenes',
] // PLACEHOLDER — no real gallery images yet; categories are real, media is not

export const instagramItems = [
  { id: 'ig-1', permalink: 'https://instagram.com/elato.in', caption: 'Signature sundae, plated for a Friday evening.' },
  { id: 'ig-2', permalink: 'https://instagram.com/elato.in', caption: 'Morning light in the Stay courtyard.' },
  { id: 'ig-3', permalink: 'https://instagram.com/elato.in', caption: 'An engagement, celebrated in Celebré.' },
  { id: 'ig-4', permalink: 'https://instagram.com/elato.in', caption: 'Belgian chocolate, slow-poured.' },
  { id: 'ig-5', permalink: 'https://instagram.com/elato.in', caption: 'A quiet corner of the boutique stay.' },
  { id: 'ig-6', permalink: 'https://instagram.com/elato.in', caption: 'Table settings for a milestone birthday.' },
] // PLACEHOLDER — shaped like GET /api/v1/instagram/latest; real handle @elato.in confirmed, real posts not yet synced

export const reviews = [
  {
    id: 'rev-1',
    author: 'Ayesha K.',
    rating: 5,
    text: 'Booked our engagement here — the space looked exactly like the photos, and the team made it effortless.',
  },
  {
    id: 'rev-2',
    author: 'Rahul M.',
    rating: 5,
    text: 'Best sundae in Mangaluru, hands down. Order is always ready within minutes of the WhatsApp confirmation.',
  },
  {
    id: 'rev-3',
    author: 'Farida S.',
    rating: 5,
    text: 'A genuinely boutique stay — quiet, considered, and worth planning a weekend around.',
  },
] // PLACEHOLDER — shaped like GET /api/v1/reviews/featured; real Google reviews not yet synced

export const aggregateRating = {
  rating: 4.9,
  count: 1240,
} // PLACEHOLDER
