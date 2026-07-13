/**
 * Simulated data-access layer for Events, shaped like the future Supabase
 * query it will become. Consumers call this, never `eventsContent.ts`
 * directly — swapping in a real client later means rewriting only this file.
 */
import { featuredEvents, type FeaturedEvent } from '../content/eventsContent'
import { simulateFetch } from './simulateFetch'

export async function getFeaturedEvents(): Promise<FeaturedEvent[]> {
  return simulateFetch([...featuredEvents].sort((a, b) => a.sortOrder - b.sortOrder))
}
