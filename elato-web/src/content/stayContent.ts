/**
 * Content for the Stay page (`/elato-stay`). Business facts below (capacity,
 * bedrooms, amenities, location) are REAL, from the client's Booking.com
 * listing copy. Photography and exact styling copy remain placeholders.
 */

export const stayHero = {
  tagline: 'A Spacious 2BHK Premium Serviced Apartment for 6–8 Guests',
}

export const stayInfo = [
  { label: 'Capacity', value: '6–8 guests' },
  { label: 'Bedrooms', value: '2 (family rooms)' },
  { label: 'Bathrooms', value: '2' },
  { label: 'Kitchen', value: 'Fully equipped' },
]

export const introduction = {
  overline: 'The Stay',
  title: 'A spacious 2BHK, for however long the occasion needs',
  paragraphs: [
    'Elato Events & Stay offers a spacious apartment with two bedrooms and two bathrooms, with family rooms ensuring comfort for all guests.',
    'Guests enjoy free WiFi, air-conditioning, and a terrace. The apartment includes a balcony, kitchen, and a fully equipped kitchen — built for family trips, wedding guests, business travelers, and vacation stays alike.',
  ],
  highlights: ['Fully furnished', 'Spacious living area', 'Peaceful environment'],
}

export type Room = {
  id: string
  name: string
  description: string
  maxOccupancy: number
  amenities: string[]
}

export const rooms: Room[] = [
  {
    id: 'elato-2bhk',
    name: 'ELATŌ Stay — 2BHK Premium Apartment',
    description:
      'A fully furnished, spacious apartment near Panemangalore — two premium bedrooms, two modern bathrooms, a fully equipped kitchen, and a private terrace and balcony.',
    maxOccupancy: 8,
    amenities: ['2 Bedrooms', '2 Bathrooms', 'Free Wi-Fi', 'Air Conditioning', 'Kitchen', 'Balcony', 'Terrace', 'Parking'],
  },
]

export const amenities = [
  'Fully Furnished',
  'Spacious Living Area',
  'Premium Bedrooms',
  'Modern Bathrooms',
  'Kitchen',
  'Parking',
  'Peaceful Environment',
  'Free Wi-Fi',
]

export const nearbyLocations = [
  { label: 'Mangalore International Airport', distance: '27 km' },
  { label: 'Mangalore Central Station', distance: '27 km' },
  { label: 'Kadri Manjunath Temple', distance: '26 km' },
  { label: 'Mangala Devi Temple', distance: '28 km' },
  { label: 'Gokarnanatheshwara Temple', distance: '29 km' },
]

export type GalleryItem = { id: string; caption: string; span: 'tall' | 'wide' | 'normal' }

export const galleryItems: GalleryItem[] = [
  { id: 'g-1', caption: 'Morning light in the living area', span: 'tall' },
  { id: 'g-2', caption: 'The apartment, in the afternoon', span: 'normal' },
  { id: 'g-3', caption: 'A considered corner of the bedroom', span: 'wide' },
  { id: 'g-4', caption: 'The fully equipped kitchen', span: 'normal' },
  { id: 'g-5', caption: 'The terrace, in the evening', span: 'tall' },
  { id: 'g-6', caption: 'Evening on the balcony', span: 'normal' },
  { id: 'g-7', caption: 'Textures of the stay', span: 'wide' },
] // PLACEHOLDER — captions are real-scene descriptions; photography not yet supplied

export const hospitalityPromise =
  'We do not fill your stay with things to do. We simply make sure nothing is missing.'

export const STAY_GUEST_MIN = 1
export const STAY_GUEST_MAX = 8
