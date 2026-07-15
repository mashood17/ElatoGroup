/**
 * Single wiring point for Services section imagery. Swap these three
 * imports for real photography (dropped into src/assets/services/) and
 * every card updates — no other file needs to change.
 */

import celebrePlaceholder from '../assets/services/celebre.webp'
import stayPlaceholder from '../assets/services/stay.png'
import eventsPlaceholder from '../assets/services/events.png'
export const serviceImages: Record<string, string> = {
  celebre: celebrePlaceholder,
  stay: stayPlaceholder,
  events: eventsPlaceholder,
}
