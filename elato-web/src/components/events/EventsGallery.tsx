import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { EventsGalleryGrid } from './gallery/EventsGalleryGrid'
import { EventsLightbox } from './gallery/EventsLightbox'
import { eventGalleryItems, type EventGalleryItem } from '../../content/eventsContent'
import { sectionReveal, viewportOnce } from '../../lib/motion'

const CATEGORIES = ['All', ...Array.from(new Set(eventGalleryItems.map((i) => i.category)))]

export function EventsGallery() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [openItem, setOpenItem] = useState<EventGalleryItem | null>(null)

  const filteredItems = useMemo(
    () => (activeCategory === 'All' ? eventGalleryItems : eventGalleryItems.filter((i) => i.category === activeCategory)),
    [activeCategory],
  )

  return (
    <section className="bg-surface-base py-16 lg:py-32">
      <div className="container-elato">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
          className="text-h2 mb-4 text-center text-secondary-900"
        >
          From Recent Celebrations
        </motion.h2>
        <p className="text-body mx-auto mb-10 max-w-xl text-center text-neutral-warm-500">
          A glimpse of the hall, dressed for the occasions we host most.
        </p>

        <div className="mb-10 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter gallery by event type">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
              className={`rounded-full border px-4 py-2 text-caption transition-colors duration-200 ease-out ${
                activeCategory === category
                  ? 'border-secondary-500 bg-secondary-500 text-white'
                  : 'border-primary-100 text-neutral-warm-500 hover:border-secondary-500 hover:text-secondary-500'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <EventsGalleryGrid items={filteredItems} onOpen={setOpenItem} />
      </div>

      <EventsLightbox item={openItem} onClose={() => setOpenItem(null)} />
    </section>
  )
}
