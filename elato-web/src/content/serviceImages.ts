/**
 * Single wiring point for Services section imagery. Swap these three
 * imports for real photography (dropped into src/assets/services/) and
 * every card updates — no other file needs to change.
 *
 * Each experience has exactly one image, keyed by `serviceImageKeys` below —
 * the Home "Discover ELATŌ" card and that experience's destination-page hero
 * both read the same `site_content` key (via `useSiteImage`/`useSiteImages`)
 * and the same static fallback here. That's what makes the shared-element
 * transition end on the exact same asset it started on: there is nothing to
 * swap, because card and hero were never two different images.
 */

import celebrePlaceholder from '../assets/services/celebre.webp'
import stayPlaceholder from '../assets/services/stay.webp'
import eventsPlaceholder from '../assets/services/events.webp'

export type ServiceId = 'celebre' | 'stay' | 'events'

export const serviceImages: Record<ServiceId, string> = {
  celebre: celebrePlaceholder,
  stay: stayPlaceholder,
  events: eventsPlaceholder,
}

/** The `site_content` key each experience's shared image is stored under. */
export const serviceImageKeys: Record<ServiceId, string> = {
  celebre: 'home_services_celebre_image',
  stay: 'home_services_stay_image',
  events: 'home_services_events_image',
}
