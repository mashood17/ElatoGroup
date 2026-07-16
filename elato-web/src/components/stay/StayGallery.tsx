import { motion } from 'framer-motion'
import { GalleryGrid } from './gallery/GalleryGrid'
import sectionBackground from '../../assets/newbg/bg2.png'
import sectionBackgroundMobile from '../../assets/newbg/bg-mb2.png'
import { SectionBackground } from '../ui/SectionBackground'
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
        <GalleryGrid items={galleryItems} />
      </div>
    </section>
  )
}
