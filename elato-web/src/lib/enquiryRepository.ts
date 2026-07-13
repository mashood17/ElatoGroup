/**
 * Persists every enquiry/order form to the backend alongside the existing
 * WhatsApp handoff, so nothing is lost if a visitor opens WhatsApp but
 * doesn't send. Deliberately fire-and-forget from the caller's perspective —
 * never awaited before opening the WhatsApp deep-link, since `window.open`
 * must run synchronously inside the click handler or browsers block the popup.
 */
import { apiPost } from './apiClient'

export type EnquirySourcePage = 'home' | 'stay' | 'events' | 'celebre'

export type EnquiryPayload = {
  source_page: EnquirySourcePage
  name: string
  phone: string
  email?: string
  message?: string
  guests?: number
  preferred_date?: string
}

export function persistEnquiry(payload: EnquiryPayload): void {
  apiPost('/api/v1/enquiries', payload).catch(() => {
    // Intentionally silent — the WhatsApp handoff is the primary path; this
    // is a best-effort backup so a dropped request never blocks the user.
  })
}
