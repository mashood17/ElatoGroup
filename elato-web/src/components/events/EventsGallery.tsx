import { useState } from 'react'
import { motion } from 'framer-motion'
import { EventsGalleryGrid } from './gallery/EventsGalleryGrid'
import { EventsLightbox } from './gallery/EventsLightbox'
import type { EventsGalleryTile } from './gallery/EventsGalleryItem'
import { eventGalleryItems, type EventGalleryItem } from '../../content/eventsContent'
import { useEventsGallery } from '../../lib/useEventsGallery'
import { sectionReveal, viewportOnce } from '../../lib/motion'
import bgDesktop from '../../assets/newbg/bg.jpg'
import bgMobile from '../../assets/newbg/bg-mb.png'

// Masonry span rhythm reused for the admin-managed photos so the grid keeps
// the same varied "tall / wide / normal" layout regardless of how many
// photos an admin adds.
const SPAN_PATTERN: EventGalleryItem['span'][] = ['wide', 'tall', 'normal', 'normal', 'wide', 'tall', 'normal', 'normal']

/**
 * "Captured Moments" — driven by the admin-managed Events gallery
 * (GET /gallery?category=events). Layout, animation, and interaction live in
 * ./gallery/EventsGalleryGrid.tsx and ./gallery/EventsGalleryItem.tsx. While
 * loading or if no photos have been added yet, it falls back to the static
 * placeholder tiles so the section never looks broken.
 */
export function EventsGallery() {
  const [openItem, setOpenItem] = useState<EventsGalleryTile | null>(null)
  const { status, images } = useEventsGallery()

  const liveTiles: EventsGalleryTile[] = images.map((img, i) => ({
    id: img.id,
    caption: img.caption,
    span: SPAN_PATTERN[i % SPAN_PATTERN.length],
    url: img.url,
  }))

  const tiles: EventsGalleryTile[] = status === 'ready' ? liveTiles : eventGalleryItems

  return (
    <section className="relative overflow-hidden py-16 lg:py-32">
      <div className="absolute inset-0 -z-10 bg-cover bg-center sm:hidden" style={{ backgroundImage: `url(${bgMobile})` }} aria-hidden="true" />
      <div className="absolute inset-0 -z-10 hidden bg-cover bg-center sm:block" style={{ backgroundImage: `url(${bgDesktop})` }} aria-hidden="true" />
      <div className="container-elato">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
          className="mb-10 text-center"
        >
          <p className="text-caption text-secondary-500">Captured Moments</p>
          <h2 className="text-h2 mt-3 font-sans font-bold text-[#9e7641]">Celebrations That Tell Their Own Story</h2>
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
          <EventsGalleryGrid items={tiles} onOpen={setOpenItem} />
        )}
      </div>

      <EventsLightbox item={openItem} onClose={() => setOpenItem(null)} />
    </section>
  )
}
