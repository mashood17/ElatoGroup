import { motion } from 'framer-motion'
import { EventsGalleryItem } from './EventsGalleryItem'
import type { EventGalleryItem as EventGalleryItemType } from '../../../content/eventsContent'
import { staggerContainer, viewportOnce } from '../../../lib/motion'

export function EventsGalleryGrid({
  items,
  onOpen,
}: {
  items: EventGalleryItemType[]
  onOpen: (item: EventGalleryItemType) => void
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg bg-primary-50 py-16 text-center text-body text-neutral-warm-500">
        No photos in this category yet.
      </p>
    )
  }

  return (
    <motion.div
      key={items.map((i) => i.id).join('-')}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerContainer}
      className="grid auto-rows-[160px] grid-cols-2 gap-4 lg:auto-rows-[220px] lg:grid-cols-4 lg:gap-6"
    >
      {items.map((item, i) => (
        <EventsGalleryItem key={item.id} item={item} index={i} onOpen={onOpen} />
      ))}
    </motion.div>
  )
}
