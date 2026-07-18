import { memo, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { MenuItemRow } from './MenuItemRow'
import type { Category, MenuItem } from '../../../content/celebreContent'
import { sectionReveal, viewportOnce } from '../../../lib/motion'

const gradients = [
  'from-primary-300 to-secondary-500',
  'from-secondary-500 to-primary-100',
  'from-primary-100 to-secondary-700',
  'from-secondary-700 to-primary-300',
  'from-secondary-500 to-secondary-700',
  'from-primary-300 to-primary-100',
]

export const CategoryRow = memo(function CategoryRow({
  category,
  items,
  index,
  onOpenItem,
}: {
  category: Category
  items: MenuItem[]
  index: number
  onOpenItem: (id: string) => void
}) {
  const reversed = index % 2 === 1
  const rowRef = useRef<HTMLDivElement>(null)

  // Tracks scroll progress across the row (first item to last item) so the
  // sticky image drifts down as the category scrolls by, and back up in reverse.
  const { scrollYProgress } = useScroll({ target: rowRef, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={sectionReveal}
      className="py-16 lg:py-24"
    >
      <h3 className="text-h2 font-sans font-bold text-[#9e7641]">{category.name}</h3>
      <p className="text-body mt-3 max-w-md text-neutral-warm-500">{category.description}</p>

      <div
        ref={rowRef}
        className={`mt-8 grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-20 ${
          reversed ? 'lg:[&>*:first-child]:order-2' : ''
        }`}
      >
        <div>
          {items.map((item) => (
            <MenuItemRow key={item.id} item={item} onOpen={onOpenItem} />
          ))}
        </div>

        <div className="hidden lg:sticky lg:top-28 lg:block">
          <motion.div
            style={{ y, willChange: 'transform' }}
            className={`relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-elato-xl ring-1 ring-black/5 bg-gradient-to-br ${gradients[index % gradients.length]}`}
            aria-hidden="true"
          >
            {category.imageUrl && (
              <img src={category.imageUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-secondary-900/15 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/15 via-transparent to-transparent" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
})
