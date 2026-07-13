import { motion } from 'framer-motion'
import { GalleryItem } from './GalleryItem'
import type { GalleryItem as GalleryItemType } from '../../../content/stayContent'
import { staggerContainer, viewportOnce } from '../../../lib/motion'

export function GalleryGrid({ items }: { items: GalleryItemType[] }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerContainer}
      className="grid auto-rows-[160px] grid-cols-2 gap-4 lg:auto-rows-[220px] lg:grid-cols-4 lg:gap-6"
    >
      {items.map((item, i) => (
        <GalleryItem key={item.id} item={item} index={i} />
      ))}
    </motion.div>
  )
}
