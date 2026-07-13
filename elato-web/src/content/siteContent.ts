/**
 * Placeholder content for Phase 1 (Homepage only, no backend).
 *
 * Everything below is shaped like the future API responses described in the
 * PRD (site_content, instagram_cache, google_reviews_cache) so that wiring a
 * real Supabase/FastAPI backend later is a data-source swap, not a rewrite.
 *
 * PLACEHOLDER — every business detail (phone, WhatsApp number, address,
 * hours, Instagram handle, review content) is a stand-in pending real data
 * from the client. Replace before launch.
 */

export const businessInfo = {
  address: 'Panemangalore, Mangaluru, Karnataka, India', // PLACEHOLDER
  phone: '+91 90000 00000', // PLACEHOLDER
  whatsappNumber: '919000000000', // PLACEHOLDER — E.164 digits only, for wa.me links
  instagramHandle: '@elato.mangalore', // PLACEHOLDER
  instagramUrl: 'https://instagram.com/elato.mangalore', // PLACEHOLDER
  googleReviewsUrl: 'https://www.google.com/maps', // PLACEHOLDER
  bookingComUrl: 'https://www.booking.com', // PLACEHOLDER
  hours: [
    { day: 'Mon – Thu', time: '11:00 AM – 10:00 PM' },
    { day: 'Fri – Sun', time: '11:00 AM – 11:00 PM' },
  ], // PLACEHOLDER
} as const

export const heroContent = {
  overline: 'ELATŌ',
  headline: 'Crafting Moments Worth Savoring',
  subStatement:
    'A premium dessert café, boutique stay, and celebration destination in Mangalore.',
  ctaLabel: 'Discover Elato',
}

export const servicesContent = [
  {
    id: 'stay',
    title: 'Elato Stay',
    descriptor: 'A boutique place to slow down and stay a while.',
  },
  {
    id: 'celebre',
    title: 'Elato Celebré',
    descriptor: 'Signature ice creams, sundaes, cakes and shakes.',
  },
  {
    id: 'events',
    title: 'Elato Events',
    descriptor: "A premium space to host life's milestone celebrations.",
  },
] as const

export const aboutContent = {
  overline: 'Our Story',
  title: 'A hospitality-grade experience, from the first impression onward',
  paragraphs: [
    'ELATŌ began as a single idea: that a dessert outing, a weekend stay, or an evening celebration should feel considered from the first moment to the last.',
    'Every detail — from the pour of a sundae to the light in a boutique room — is handled with the same restraint and care, so that nothing about the experience ever feels rushed.',
  ],
  ctaLabel: 'Read our full story',
}

export const instagramItems = [
  { id: 'ig-1', permalink: 'https://instagram.com/p/placeholder1', caption: 'Signature sundae, plated for a Friday evening.' },
  { id: 'ig-2', permalink: 'https://instagram.com/p/placeholder2', caption: 'Morning light in the Stay courtyard.' },
  { id: 'ig-3', permalink: 'https://instagram.com/p/placeholder3', caption: 'An engagement, celebrated in Celebré.' },
  { id: 'ig-4', permalink: 'https://instagram.com/p/placeholder4', caption: 'Belgian chocolate, slow-poured.' },
  { id: 'ig-5', permalink: 'https://instagram.com/p/placeholder5', caption: 'A quiet corner of the boutique stay.' },
  { id: 'ig-6', permalink: 'https://instagram.com/p/placeholder6', caption: 'Table settings for a milestone birthday.' },
] // PLACEHOLDER — shaped like GET /api/v1/instagram/latest

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
] // PLACEHOLDER — shaped like GET /api/v1/reviews/featured

export const aggregateRating = {
  rating: 4.9,
  count: 1240,
} // PLACEHOLDER
