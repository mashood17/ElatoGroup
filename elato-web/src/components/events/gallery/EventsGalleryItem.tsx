import { motion } from 'framer-motion'
import type { EventGalleryItem as EventGalleryItemType } from '../../../content/eventsContent'
import { sectionReveal } from '../../../lib/motion'

// `category` and `url` are optional: admin-managed gallery photos supply a
// real image and only a caption (no event-type tag), while the static
// placeholder items (used before any photos are added) fall back to the
// original gradient tiles with a category tag so the layout never looks broken.
export type EventsGalleryTile = Omit<EventGalleryItemType, 'category'> & {
  category?: EventGalleryItemType['category']
  url?: string
}

const spanClasses: Record<EventGalleryItemType['span'], string> = {
  tall: 'row-span-2',
  wide: 'col-span-2',
  normal: '',
}

const gradients = [
  'from-primary-300 to-secondary-500',
  'from-secondary-500 to-primary-100',
  'from-primary-100 to-secondary-700',
  'from-secondary-700 to-primary-300',
]

export function EventsGalleryItem({
  item,
  index,
  onOpen,
}: {
  item: EventsGalleryTile
  index: number
  onOpen: (item: EventsGalleryTile) => void
}) {
  return (
    <motion.button
      type="button"
      variants={sectionReveal}
      onClick={() => onOpen(item)}
      aria-haspopup="dialog"
      className={`group relative overflow-hidden rounded-lg text-left shadow-elato-sm focus-visible:outline-none ${spanClasses[item.span]}`}
    >
      {item.url ? (
        <img
          src={item.url}
          alt={item.caption}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <div
          className={`h-full w-full bg-gradient-to-br transition-transform duration-500 ease-out group-hover:scale-105 ${gradients[index % gradients.length]}`}
          aria-hidden="true"
        />
      )}
      <div
        className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-secondary-900/70 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
        aria-hidden="true"
      >
        {item.category && <span className="text-caption text-primary-300">{item.category}</span>}
        <span className="text-caption text-white">{item.caption}</span>
      </div>
      <span className="sr-only">{item.category ? `${item.category}: ${item.caption}` : item.caption}</span>
    </motion.button>
  )
}
