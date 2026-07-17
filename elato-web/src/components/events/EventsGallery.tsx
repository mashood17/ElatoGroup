import { useState } from 'react'
import { motion } from 'framer-motion'
import { EventsGalleryGrid } from './gallery/EventsGalleryGrid'
import { EventsLightbox } from './gallery/EventsLightbox'
import { eventGalleryItems, type EventGalleryItem } from '../../content/eventsContent'
import { sectionReveal, viewportOnce } from '../../lib/motion'
import bgDesktop from '../../assets/newbg/bg.jpg'
import bgMobile from '../../assets/newbg/bg-mb.png'

export function EventsGallery() {
  const [openItem, setOpenItem] = useState<EventGalleryItem | null>(null)

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

        <EventsGalleryGrid items={eventGalleryItems} onOpen={setOpenItem} />
      </div>

      <EventsLightbox item={openItem} onClose={() => setOpenItem(null)} />
    </section>
  )
}
