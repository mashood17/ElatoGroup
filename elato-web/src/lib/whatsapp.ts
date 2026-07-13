/** Builds a wa.me deep-link with a URL-encoded pre-filled message (PRD Ch. 39). */
export function buildWhatsAppLink(phoneDigits: string, message: string): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`
}
