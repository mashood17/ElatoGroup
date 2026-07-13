import { motion } from 'framer-motion'
import type { EventGalleryItem as EventGalleryItemType } from '../../../content/eventsContent'
import { sectionReveal } from '../../../lib/motion'

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
  item: EventGalleryItemType
  index: number
  onOpen: (item: EventGalleryItemType) => void
}) {
  return (
    <motion.button
      type="button"
      variants={sectionReveal}
      onClick={() => onOpen(item)}
      aria-haspopup="dialog"
      className={`group relative overflow-hidden rounded-lg text-left shadow-elato-sm focus-visible:outline-none ${spanClasses[item.span]}`}
    >
      <div
        className={`h-full w-full bg-gradient-to-br transition-transform duration-500 ease-out group-hover:scale-105 ${gradients[index % gradients.length]}`}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-secondary-900/70 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
        aria-hidden="true"
      >
        <span className="text-caption text-primary-300">{item.category}</span>
        <span className="text-caption text-white">{item.caption}</span>
      </div>
      <span className="sr-only">{`${item.category}: ${item.caption}`}</span>
    </motion.button>
  )
}
