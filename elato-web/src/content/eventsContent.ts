/**
 * Placeholder content for the Events page (`/elato-events`), no backend.
 * Shaped the same way as `stayContent.ts`/`celebreContent.ts` — clearly
 * marked PLACEHOLDER, read only through `src/lib/eventsRepository.ts` so a
 * real Supabase table swap later touches this file, not any component.
 */

export type FeaturedEvent = {
  id: string
  title: string
  description: string
  capacity: string
  startingPrice?: number
  sortOrder: number
}

export const featuredEvents: FeaturedEvent[] = [
  { id: 'ev-birthday', title: 'Birthday Celebrations', description: 'A table set exactly the way the guest of honour would want it.', capacity: 'Up to 40 guests', startingPrice: 15000, sortOrder: 0 },
  { id: 'ev-anniversary', title: 'Anniversary Celebrations', description: 'A quieter, considered evening for milestones worth marking well.', capacity: 'Up to 30 guests', startingPrice: 18000, sortOrder: 1 },
  { id: 'ev-baby-shower', title: 'Baby Shower', description: 'Soft, warm, and unhurried — for the celebration before the celebration.', capacity: 'Up to 35 guests', startingPrice: 14000, sortOrder: 2 },
  { id: 'ev-corporate', title: 'Corporate Events', description: 'Professional enough for the client, warm enough for the team.', capacity: 'Up to 60 guests', startingPrice: 25000, sortOrder: 3 },
  { id: 'ev-engagement', title: 'Engagement Party', description: 'The first celebration of many — treated like it deserves to be.', capacity: 'Up to 50 guests', startingPrice: 22000, sortOrder: 4 },
  { id: 'ev-family-gathering', title: 'Family Gatherings', description: 'A space large enough for everyone, quiet enough to actually talk.', capacity: 'Up to 45 guests', startingPrice: 16000, sortOrder: 5 },
  { id: 'ev-graduation', title: 'Graduation Party', description: 'A milestone that took years, celebrated properly in one evening.', capacity: 'Up to 40 guests', startingPrice: 15000, sortOrder: 6 },
  { id: 'ev-bridal-shower', title: 'Bridal Shower', description: 'An elegant, intimate gathering before the bigger day.', capacity: 'Up to 30 guests', startingPrice: 17000, sortOrder: 7 },
  { id: 'ev-farewell', title: 'Farewell Party', description: 'A proper send-off, without it feeling like an office party.', capacity: 'Up to 40 guests', startingPrice: 16000, sortOrder: 8 },
  { id: 'ev-friends-reunion', title: 'Friends Reunion', description: "For the group that hasn't all been in the same room in years.", capacity: 'Up to 35 guests', startingPrice: 14000, sortOrder: 9 },
  { id: 'ev-private-dining', title: 'Private Dining', description: 'A closed room, a set menu, and nowhere else to be.', capacity: 'Up to 20 guests', startingPrice: 20000, sortOrder: 10 },
  { id: 'ev-custom', title: 'Custom Celebrations', description: "Tell us the occasion — we'll build the room around it.", capacity: 'Up to 100 guests', sortOrder: 11 },
] // PLACEHOLDER — 10-12 featured event offerings per brief
