/**
 * Single wiring point for Services section imagery. Each experience has
 * exactly one image, keyed by `serviceImageKeys` below — the Home "Discover
 * ELATŌ" card and that experience's destination-page hero both read the same
 * `site_content` key (via `useSiteImage`/`useSiteImages`) and swap in the
 * admin-uploaded photo. There is no bundled static fallback: until the admin
 * uploads one, consumers (`ServiceCard`, `PremiumHero`) render their own
 * placeholder. That's also what makes the shared-element transition end on
 * the exact same asset it started on — card and hero were never two
 * different images.
 */

export type ServiceId = 'celebre' | 'stay' | 'events'

export const serviceImages: Record<ServiceId, string> = {
  celebre: '',
  stay: '',
  events: '',
}

/** The `site_content` key each experience's shared image is stored under. */
export const serviceImageKeys: Record<ServiceId, string> = {
  celebre: 'home_services_celebre_image',
  stay: 'home_services_stay_image',
  events: 'home_services_events_image',
}
