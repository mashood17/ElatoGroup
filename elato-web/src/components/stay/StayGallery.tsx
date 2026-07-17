import { motion } from 'framer-motion'
import { GalleryGrid } from './gallery/GalleryGrid'
import type { StayGalleryTile } from './gallery/GalleryItem'
import sectionBackground from '../../assets/newbg/bg2.png'
import sectionBackgroundMobile from '../../assets/newbg/bg-mb2.png'
import { SectionBackground } from '../ui/SectionBackground'
import { galleryItems, type GalleryItem as GalleryItemType } from '../../content/stayContent'
import { useStayGallery } from '../../lib/useStayGallery'
import { sectionReveal, viewportOnce } from '../../lib/motion'

// Masonry span rhythm reused for the admin-managed photos so the grid keeps
// the same varied "tall / wide / normal" layout regardless of how many
// photos an admin adds.
const SPAN_PATTERN: GalleryItemType['span'][] = ['tall', 'normal', 'wide', 'normal', 'tall', 'normal', 'wide']

/**
 * "A Glimpse Inside" — driven by the admin-managed Stay gallery
 * (GET /gallery?category=stay). Layout, animation, and interaction live in
 * ./gallery/GalleryGrid.tsx and ./gallery/GalleryItem.tsx. While loading or
 * if no photos have been added yet, it falls back to the static placeholder
 * tiles so the section never looks broken.
 */
export function StayGallery() {
  const { status, images } = useStayGallery()

  const liveTiles: StayGalleryTile[] = images.map((img, i) => ({
    id: img.id,
    caption: img.caption,
    span: SPAN_PATTERN[i % SPAN_PATTERN.length],
    url: img.url,
  }))

  const tiles: StayGalleryTile[] = status === 'ready' ? liveTiles : galleryItems

  return (
    <section className="relative overflow-hidden py-16 lg:py-32">
      <SectionBackground image={sectionBackground} mobileImage={sectionBackgroundMobile} />
      <div className="container-elato relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
          className="mb-12 text-center"
        >
          <p className="text-caption text-secondary-500">A Glimpse Inside</p>
          <h2 className="text-h2 mt-3 font-sans font-bold text-[#9e7641]">Spaces Designed for Comfort and Calm</h2>
        </motion.div>

        {status === 'loading' ? (
          <div className="grid auto-rows-[160px] grid-cols-2 gap-4 lg:auto-rows-[220px] lg:grid-cols-4 lg:gap-6">
            {SPAN_PATTERN.map((span, i) => (
              <div
                key={i}
                className={`animate-pulse rounded-lg bg-[#9e7641]/10 ${span === 'tall' ? 'row-span-2' : span === 'wide' ? 'col-span-2' : ''}`}
              />
            ))}
          </div>
        ) : (
          <GalleryGrid items={tiles} />
        )}
      </div>
    </section>
  )
}
