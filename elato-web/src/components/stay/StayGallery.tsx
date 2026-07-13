import { motion } from 'framer-motion'
import { GalleryGrid } from './gallery/GalleryGrid'
import { galleryItems } from '../../content/stayContent'
import { sectionReveal, viewportOnce } from '../../lib/motion'

/**
 * Isolated on purpose — layout, animation, and interaction live in
 * ./gallery/GalleryGrid.tsx and ./gallery/GalleryItem.tsx, driven entirely by
 * the `galleryItems` data array. Swapping this for a specific 21st.dev
 * reference later means editing those two files, not the rest of the page.
 */
export function StayGallery() {
  return (
    <section className="bg-surface-base py-16 lg:py-32">
      <div className="container-elato">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
          className="text-h2 mb-12 text-center text-secondary-900"
        >
          A Feel For the Place
        </motion.h2>
        <GalleryGrid items={galleryItems} />
      </div>
    </section>
  )
}
