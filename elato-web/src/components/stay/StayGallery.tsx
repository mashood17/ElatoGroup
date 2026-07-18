import { motion } from 'framer-motion'
import { PerspectiveGallery, type PerspectiveGalleryItem } from '../ui/PerspectiveGallery'
import sectionBackground from '../../assets/newbg/bg2.png'
import sectionBackgroundMobile from '../../assets/newbg/bg-mb2.png'
import { SectionBackground } from '../ui/SectionBackground'
import { galleryItems } from '../../content/stayContent'
import { useStayGallery } from '../../lib/useStayGallery'
import { sectionReveal, viewportOnce } from '../../lib/motion'

/**
 * "A Glimpse Inside" — driven by the admin-managed Stay gallery
 * (GET /gallery?category=stay). Presented via the shared PerspectiveGallery
 * (../ui/PerspectiveGallery.tsx) — also used by Events' "Captured Moments" —
 * so cards, controls, and motion stay identical across both pages; only the
 * section background differs. While loading or if no photos have been
 * added yet, it falls back to the static placeholder tiles so the section
 * never looks broken.
 */
export function StayGallery() {
  const { status, images } = useStayGallery()

  const liveTiles: PerspectiveGalleryItem[] = images.map((img) => ({
    id: img.id,
    caption: img.caption,
    url: img.url,
  }))

  const tiles: PerspectiveGalleryItem[] = status === 'ready' ? liveTiles : galleryItems

  return (
    <section className="relative overflow-hidden py-20 lg:py-36">
      <SectionBackground image={sectionBackground} mobileImage={sectionBackgroundMobile} />

      <div className="container-elato relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
          className="mb-6 text-center lg:mb-2"
        >
          <p className="text-caption text-secondary-500">A Glimpse Inside</p>
          <h2 className="text-h2 mt-3 font-sans font-bold text-[#9e7641]">Spaces Designed for Comfort and Calm</h2>
        </motion.div>

        {status === 'loading' ? (
          <div className="mx-auto flex h-[26rem] w-full max-w-[72rem] items-center justify-center gap-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`animate-pulse rounded-[36px] bg-[#9e7641]/10 ${i === 1 ? 'h-[85%] w-[22%]' : 'h-[65%] w-[18%]'}`}
              />
            ))}
          </div>
        ) : (
          <PerspectiveGallery items={tiles} ariaLabel="Stay photo gallery — drag, swipe, or use arrow keys to browse" />
        )}
      </div>
    </section>
  )
}
