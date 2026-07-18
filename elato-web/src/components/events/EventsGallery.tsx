import { motion } from 'framer-motion'
import { PerspectiveGallery, type PerspectiveGalleryItem } from '../ui/PerspectiveGallery'
import { eventGalleryItems } from '../../content/eventsContent'
import { useEventsGallery } from '../../lib/useEventsGallery'
import { sectionReveal, viewportOnce } from '../../lib/motion'
import { useSectionExitFade } from '../../lib/useSectionExitFade'
import bgDesktop from '../../assets/newbg/bg.webp'
import bgMobile from '../../assets/newbg/bg-mb.webp'

/**
 * "Captured Moments" — driven by the admin-managed Events gallery
 * (GET /gallery?category=events). Presented via the shared PerspectiveGallery
 * (../ui/PerspectiveGallery.tsx) — the exact same cards, controls, and
 * motion as Stay's "A Glimpse Inside"; only this section's own background
 * differs. While loading or if no photos have been added yet, it falls
 * back to the static placeholder tiles so the section never looks broken.
 */
export function EventsGallery() {
  const { status, images } = useEventsGallery()
  const exitFade = useSectionExitFade<HTMLElement>()

  const liveTiles: PerspectiveGalleryItem[] = images.map((img) => ({
    id: img.id,
    caption: img.caption,
    url: img.url,
  }))

  const tiles: PerspectiveGalleryItem[] = status === 'ready' ? liveTiles : eventGalleryItems

  return (
    <motion.section ref={exitFade.ref} style={exitFade.style} className="relative overflow-hidden py-16 lg:py-32">
      <div className="absolute inset-0 -z-10 bg-cover bg-center sm:hidden" style={{ backgroundImage: `url(${bgMobile})` }} aria-hidden="true" />
      <div className="absolute inset-0 -z-10 hidden bg-cover bg-center sm:block" style={{ backgroundImage: `url(${bgDesktop})` }} aria-hidden="true" />
      <div className="container-elato relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
          className="mb-6 text-center lg:mb-2"
        >
          <p className="text-caption text-secondary-500">Captured Moments</p>
          <h2 className="text-h2 mt-3 font-sans font-bold text-[#9e7641]">Celebrations That Tell Their Own Story</h2>
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
          <PerspectiveGallery items={tiles} ariaLabel="Events photo gallery — use the arrow buttons or arrow keys to browse" />
        )}
      </div>
    </motion.section>
  )
}
