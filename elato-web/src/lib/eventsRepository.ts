/**
 * Real data-access layer for Events, backed by `/api/v1/event-packages`.
 * Consumers call this, never `eventsContent.ts` directly.
 */
import { apiGet } from './apiClient'
import type { FeaturedEvent } from '../content/eventsContent'

type EventPackageDto = {
  id: string
  title: string
  description: string | null
  min_guests: number | null
  max_guests: number | null
  display_order: number
}

function capacityLabel(min: number | null, max: number | null): string {
  if (min && max) return `${min}–${max} guests`
  if (max) return `Up to ${max} guests`
  if (min) return `From ${min} guests`
  return 'Guest count on request'
}

function toFeaturedEvent(dto: EventPackageDto): FeaturedEvent {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description ?? '',
    capacity: capacityLabel(dto.min_guests, dto.max_guests),
    sortOrder: dto.display_order,
  }
}

export async function getFeaturedEvents(): Promise<FeaturedEvent[]> {
  const rows = await apiGet<EventPackageDto[]>('/api/v1/event-packages')
  return rows.map(toFeaturedEvent).sort((a, b) => a.sortOrder - b.sortOrder)
}
