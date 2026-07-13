import { SITE_URL } from './seoConfig'
import { businessInfo } from '../content/siteContent'

const address = {
  '@type': 'PostalAddress',
  streetAddress: 'Near Mandovi Motors, Melkar',
  addressLocality: 'Panemangalore, Bantwal',
  addressRegion: 'Karnataka',
  postalCode: '574231',
  addressCountry: 'IN',
}

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'ELATŌ',
    description:
      'A premium lifestyle destination in Panemangalore combining handcrafted desserts, artisan beverages, elegant celebrations, and comfortable stays.',
    url: SITE_URL,
    telephone: businessInfo.phone,
    email: businessInfo.email,
    address,
    sameAs: [businessInfo.instagramUrl],
  }
}

export function restaurantJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'ELATŌ Celebré',
    servesCuisine: ['Ice Cream', 'Desserts', 'Coffee', 'Beverages'],
    telephone: businessInfo.phone,
    address,
    url: `${SITE_URL}/elato-celebre`,
  }
}

export function eventVenueJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EventVenue',
    name: 'ELATŌ Celebré — Event Hall',
    description: 'A 200–250 guest capacity hall for weddings, engagements, and celebrations.',
    address,
    maximumAttendeeCapacity: 250,
    url: `${SITE_URL}/elato-events`,
  }
}

export function lodgingJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'ELATŌ Stay',
    description: 'A spacious 2BHK premium serviced apartment for 6–8 guests.',
    address,
    telephone: businessInfo.phone,
    url: `${SITE_URL}/elato-stay`,
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ELATŌ',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    sameAs: [businessInfo.instagramUrl],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: businessInfo.phone,
      email: businessInfo.email,
      contactType: 'customer service',
    },
  }
}
