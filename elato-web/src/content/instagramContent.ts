/**
 * Home → Instagram ("Social Moments") section content. `instagramReels`
 * here is the fallback shown only when the backend has no synced reels yet
 * (INSTAGRAM_GRAPH_TOKEN/INSTAGRAM_BUSINESS_ID not configured, or a sync
 * failure) — see InstagramSection.tsx, which fetches real reels from
 * GET /api/v1/instagram/latest via instagramRepository and only falls back
 * to this array on an empty/error result. Real reels are never hardcoded
 * here; once the backend sync is live, this file only matters as a safety
 * net.
 */

import { businessInfo } from './siteContent'

export interface InstagramReel {
  id: string
  title: string
  description: string
  href: string
  image?: string
  video?: string
  isLive: boolean
}

export const instagramHeading = {
  overline: 'Social Moments',
  title: 'Follow ELATŌ',
  description:
    'Discover our latest desserts, celebrations, events and behind-the-scenes moments directly from Instagram.',
}

export const instagramReels: InstagramReel[] = [
  {
    id: 'reel-placeholder-1',
    title: 'New Reel Coming Soon',
    description: 'Freshly churned moments from the ELATŌ kitchen, on their way to Instagram.',
    href: businessInfo.instagramUrl,
    isLive: false,
  },
  {
    id: 'reel-placeholder-2',
    title: 'New Reel Coming Soon',
    description: 'A celebration captured at Elató Celebré — landing on the grid shortly.',
    href: businessInfo.instagramUrl,
    isLive: false,
  },
  {
    id: 'reel-placeholder-3',
    title: 'New Reel Coming Soon',
    description: 'Behind the scenes at Elató Stay — check back for the full reel.',
    href: businessInfo.instagramUrl,
    isLive: false,
  },
  {
    id: 'reel-placeholder-4',
    title: 'New Reel Coming Soon',
    description: 'A signature dessert, plated for the gram — coming soon.',
    href: businessInfo.instagramUrl,
    isLive: false,
  },
  {
    id: 'reel-placeholder-5',
    title: 'New Reel Coming Soon',
    description: 'Guests celebrating at Elató Events — reel in progress.',
    href: businessInfo.instagramUrl,
    isLive: false,
  },
  {
    id: 'reel-placeholder-6',
    title: 'New Reel Coming Soon',
    description: 'More from @elato.in — follow along so you never miss a moment.',
    href: businessInfo.instagramUrl,
    isLive: false,
  },
]
