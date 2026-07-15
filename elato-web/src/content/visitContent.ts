/**
 * Home → Visit section content. Scoped separately from `businessInfo`
 * (siteContent.ts) because the WhatsApp number and hours here are a
 * temporary placeholder for this section only — Footer, JSON-LD, and the
 * Stay/Events/Celebré enquiry forms keep using businessInfo untouched.
 */

export const visitHeading = {
  overline: 'VISIT ELATŌ',
  title: 'Plan Your Visit',
  description:
    "Whether you're joining us for handcrafted desserts, celebrations, or a comfortable stay, we're delighted to welcome you every day.",
}

export const visitContact = {
  whatsappNumber: '919731400313', // E.164 digits only, for wa.me links — temporary number
  phoneDisplay: '+91 97314 00313',
  address: 'ELATŌ CELEBRÉ, Near Mandovi Motors, Melkar, Panemangalore, Bantwal, Karnataka 574231',
  hours: { day: 'Daily', time: '11:00 AM – 11:30 PM' },
}

// No-API-key embed — query + ftid pin the exact listed place (V2CX+4M6
// ELATŌ CELEBRÉ) without carrying any tracking/session tokens.
const MAP_QUERY = 'V2CX+4M6 ELATŌ CELEBRÉ, Panemangalore, Karnataka 574231'
const MAP_FTID = '0x3ba4a700766104dd:0xeedacba07390ccd2'

export const visitMap = {
  embedSrc: `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&ftid=${MAP_FTID}&output=embed`,
  openUrl: `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&ftid=${MAP_FTID}`,
}
