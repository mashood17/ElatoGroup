/**
 * Decoupled trigger for opening the scratch-card popup from anywhere (the
 * floating Offer button) without threading props through App.tsx — same
 * window-CustomEvent pattern the admin panel uses for session-expired
 * (see elato-admin/src/lib/api-client.ts's SESSION_EXPIRED_EVENT).
 */
export const OPEN_OFFER_POPUP_EVENT = 'elato:open-offer-popup'

export function openOfferPopup(): void {
  window.dispatchEvent(new CustomEvent(OPEN_OFFER_POPUP_EVENT))
}
