/**
 * Placeholder content for the Stay page (`/elato-stay`), no backend.
 * Shaped the same way as `siteContent.ts` — clearly marked PLACEHOLDER,
 * ready to swap for real copy/photography/CMS output later.
 */

export const stayHero = {
  overline: 'ELATŌ',
  wordmarkLine1: 'ELATŌ',
  wordmarkLine2: 'EVENTS & STAY',
  statement: 'A boutique place to slow down and stay a while.',
}

export const stayInfo = [
  { label: 'Check-in', value: '2:00 PM' },
  { label: 'Check-out', value: '11:00 AM' },
  { label: 'Capacity', value: 'Up to 3 guests per room' },
  { label: 'Breakfast', value: 'Included with every stay' },
] // PLACEHOLDER — PRD Ch. 13 "Stay Information"

export const introduction = {
  overline: 'The Stay',
  title: 'A quiet, considered place to belong for a while',
  paragraphs: [
    'Every room at ELATŌ is arranged around light, silence, and a small number of decisions made well — nothing added for its own sake.',
    'It is designed less like a hotel and more like a considered residence: warm materials, soft acoustics, and a rhythm that asks nothing of you.',
  ],
  highlights: ['Private courtyard access', 'Curated in-room amenities', 'Late check-out on request'],
} // PLACEHOLDER

export type Room = {
  id: string
  name: string
  description: string
  maxOccupancy: number
  amenities: string[]
}

export const rooms: Room[] = [
  {
    id: 'room-garden',
    name: 'The Garden Room',
    description: 'A ground-floor room opening onto the courtyard, for guests who want the outdoors close at hand.',
    maxOccupancy: 2,
    amenities: ['King Bed', 'Courtyard View', 'Free Wi-Fi'],
  },
  {
    id: 'room-loft',
    name: 'The Loft Room',
    description: 'An upper room with higher ceilings and softer light, suited to a longer, unhurried stay.',
    maxOccupancy: 3,
    amenities: ['King Bed', 'Reading Nook', 'Free Wi-Fi'],
  },
  {
    id: 'room-atelier',
    name: 'The Atelier Suite',
    description: 'The largest room, with a private sitting area — ELATŌ\'s quiet answer to a suite.',
    maxOccupancy: 3,
    amenities: ['King Bed', 'Sitting Area', 'Free Wi-Fi', 'Rain Shower'],
  },
] // PLACEHOLDER — PRD Ch. 13 "Room Details"

export const amenities = [
  'Free Wi-Fi',
  'Breakfast Included',
  'Private Parking',
  'Air Conditioning',
  'Room Service',
  'Daily Housekeeping',
  'Quiet Workspace',
  'Courtyard Access',
] // PLACEHOLDER — PRD Ch. 13 "Amenities"

export type GalleryItem = { id: string; caption: string; span: 'tall' | 'wide' | 'normal' }

export const galleryItems: GalleryItem[] = [
  { id: 'g-1', caption: 'Morning light in the courtyard', span: 'tall' },
  { id: 'g-2', caption: 'The Garden Room, in the afternoon', span: 'normal' },
  { id: 'g-3', caption: 'A considered corner of the Atelier Suite', span: 'wide' },
  { id: 'g-4', caption: 'Breakfast, quietly laid', span: 'normal' },
  { id: 'g-5', caption: 'The Loft Room reading nook', span: 'tall' },
  { id: 'g-6', caption: 'Evening in the courtyard', span: 'normal' },
  { id: 'g-7', caption: 'Textures of the stay', span: 'wide' },
] // PLACEHOLDER — swap for real photography once supplied; layout keyed off `span`

export const hospitalityPromise =
  'We do not fill your stay with things to do. We simply make sure nothing is missing.'

export const STAY_GUEST_MIN = 1
export const STAY_GUEST_MAX = 10
