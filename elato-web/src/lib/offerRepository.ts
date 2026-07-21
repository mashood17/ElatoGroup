/**
 * Read/write access for the scratch-card offer system. Every visitor sees
 * the same currently-active offer (admin-configured) — the scratch card is
 * only the interaction, never the source of the reward.
 */
import { apiGet, apiPost, ApiError } from './apiClient'

export interface ActiveOfferDto {
  id: string
  reward_text: string
  scratch_reveal_text: string | null
  popup_heading: string
  button_text: string
  description: string | null
}

// Shared in-flight/settled promise, same pattern as siteContentRepository/
// heroBackgroundRepository — both the popup and the floating Offer button
// ask for the active offer on mount, and should resolve from one request
// rather than firing two.
let activeOfferCache: Promise<ActiveOfferDto | null> | null = null

export function getActiveOffer(): Promise<ActiveOfferDto | null> {
  activeOfferCache ??= apiGet<ActiveOfferDto | null>('/api/v1/offers/active').catch(() => null)
  return activeOfferCache
}

/** Whether this visitor has already registered for whatever offer is
 * currently active — lets the popup skip straight to the "already claimed"
 * message instead of re-showing the scratch card. Fails open (false) so a
 * network hiccup never wrongly blocks a first-time visitor. */
export function getClaimStatus(visitorId: string): Promise<boolean> {
  return apiGet<{ claimed: boolean }>(`/api/v1/offers/active/claim-status?visitor_id=${encodeURIComponent(visitorId)}`)
    .then((res) => res.claimed)
    .catch(() => false)
}

export interface OfferRegistrationPayload {
  name: string
  country_code: string
  phone_number: string
  consent: boolean
  source: string
  visitor_id: string
}

export interface OfferRegistrationResult {
  id: string
  status: string
}

export { ApiError }

export function registerForOffer(payload: OfferRegistrationPayload): Promise<OfferRegistrationResult> {
  return apiPost<OfferRegistrationResult>('/api/v1/offers/register', payload)
}
