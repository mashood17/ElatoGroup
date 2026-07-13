/**
 * Content for the Events page (`/elato-events`).
 *
 * Event types and hall capacity below are REAL (client-confirmed). Starting
 * prices are intentionally omitted (not `undefined`-defaulted to a fake
 * number) since no real price list exists yet — do not invent one.
 */

export type FeaturedEvent = {
  id: string
  title: string
  description: string
  capacity: string
  startingPrice?: number
  sortOrder: number
}

export const EVENTS_HALL_CAPACITY_MIN = 200
export const EVENTS_HALL_CAPACITY_MAX = 250

export const featuredEvents: FeaturedEvent[] = [
  { id: 'ev-weddings', title: 'Weddings', description: 'A hall dressed for the day that anchors everything else.', capacity: 'Up to 250 guests', sortOrder: 0 },
  { id: 'ev-engagements', title: 'Engagements', description: 'The first celebration of many — treated like it deserves to be.', capacity: 'Up to 250 guests', sortOrder: 1 },
  { id: 'ev-birthday', title: 'Birthday Parties', description: 'A table set exactly the way the guest of honour would want it.', capacity: 'Up to 250 guests', sortOrder: 2 },
  { id: 'ev-naming-ceremony', title: 'Naming Ceremonies', description: 'A warm, traditional gathering, hosted with care.', capacity: 'Up to 250 guests', sortOrder: 3 },
  { id: 'ev-corporate', title: 'Corporate Events', description: 'Professional enough for the client, warm enough for the team.', capacity: 'Up to 250 guests', sortOrder: 4 },
  { id: 'ev-family-gathering', title: 'Family Gatherings', description: 'A space large enough for everyone, quiet enough to actually talk.', capacity: 'Up to 250 guests', sortOrder: 5 },
  { id: 'ev-cultural', title: 'Cultural Events', description: 'A room that adapts to the occasion, not the other way around.', capacity: 'Up to 250 guests', sortOrder: 6 },
  { id: 'ev-anniversary', title: 'Anniversary Celebrations', description: 'A quieter, considered evening for milestones worth marking well.', capacity: 'Up to 250 guests', sortOrder: 7 },
] // REAL — client-confirmed event types and hall capacity (200–250 guests)

export type EventGalleryItem = {
  id: string
  caption: string
  category: (typeof featuredEvents)[number]['title']
  span: 'tall' | 'wide' | 'normal'
}

export const eventGalleryItems: EventGalleryItem[] = [
  { id: 'eg-1', caption: 'The hall, dressed for a wedding reception', category: 'Weddings', span: 'wide' },
  { id: 'eg-2', caption: 'Table settings for an engagement evening', category: 'Engagements', span: 'tall' },
  { id: 'eg-3', caption: 'A birthday table, set for the guest of honour', category: 'Birthday Parties', span: 'normal' },
  { id: 'eg-4', caption: 'A naming ceremony, quietly decorated', category: 'Naming Ceremonies', span: 'normal' },
  { id: 'eg-5', caption: 'The hall arranged for a corporate gathering', category: 'Corporate Events', span: 'wide' },
  { id: 'eg-6', caption: 'A family gathering, long tables and warm light', category: 'Family Gatherings', span: 'tall' },
  { id: 'eg-7', caption: 'A cultural evening, staged for performance', category: 'Cultural Events', span: 'normal' },
  { id: 'eg-8', caption: 'An anniversary dinner, set for two', category: 'Anniversary Celebrations', span: 'normal' },
  { id: 'eg-9', caption: 'The hall at dusk, before a wedding', category: 'Weddings', span: 'normal' },
  { id: 'eg-10', caption: 'Floral details from a recent engagement', category: 'Engagements', span: 'normal' },
] // PLACEHOLDER — captions describe real scenes; event photography not yet supplied
