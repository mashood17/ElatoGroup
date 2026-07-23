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
  { label: 'Bedrooms', value: '2 family bedrooms' },
  { label: 'Kitchen', value: 'Kitchen area available' },
  { label: 'Location', value: 'Panemangalore, Bantwal' },
]

export const introduction = {
  overline: 'The Stay',
  title: 'A spacious 2BHK, for however long the occasion needs',
  paragraphs: [
    'Elato Events & Stay offers a spacious two-bedroom apartment with two bathrooms, thoughtfully designed to provide a comfortable and relaxing stay for families, wedding guests, business travelers, and vacationers alike.',
    'Enjoy a peaceful environment with free WiFi, air-conditioning, a private balcony, and comfortable living spaces. The apartment also includes a kitchen area for added convenience, with additional kitchen amenities being introduced over time.',
  ],
  highlights: ['Semi-furnished apartment', 'Spacious living area', 'Peaceful environment'],
}

export const amenities = [
  'Semi-Furnished',
  'Spacious Living Area',
  'Comfortable Bedrooms',
  'Modern Bathrooms',
  'Private Kitchen Space',
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
  { id: 'g-4', caption: 'The kitchen area', span: 'normal' },
  { id: 'g-5', caption: 'The terrace, in the evening', span: 'tall' },
  { id: 'g-6', caption: 'Evening on the balcony', span: 'normal' },
  { id: 'g-7', caption: 'Textures of the stay', span: 'wide' },
] // PLACEHOLDER — captions are real-scene descriptions; photography not yet supplied

export const STAY_GUEST_MIN = 1
export const STAY_GUEST_MAX = 8
