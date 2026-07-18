/**
 * Fire-and-forget analytics. `trackEvent` posts to the backend
 * (`analytics_events` table, same event names GA4 receives) and mirrors the
 * call to GA4 if it's loaded — errors on either side are swallowed so
 * analytics can never block or visibly fail a user-facing action.
 */
import { apiPost } from './apiClient'

export type AnalyticsEventName = 'whatsapp_click' | 'call_click' | 'order_generated' | 'booking_click' | 'enquiry_submitted'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackEvent(eventName: AnalyticsEventName, page: string, metadata?: Record<string, unknown>): void {
  apiPost('/api/v1/analytics/events', { event_name: eventName, page, metadata }).catch(() => {
    // Intentionally silent — analytics must never surface an error to the user.
  })

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, { page, ...metadata })
  }
}
