import type { GalleryItem as GalleryItemType } from '../../../content/stayContent'

// `url` is optional: admin-managed gallery photos supply a real image, while
// the static placeholder items (used before any photos are added) fall back
// to gradient tiles so the layout never looks broken.
export type StayGalleryTile = GalleryItemType & { url?: string }
