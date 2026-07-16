import { motion } from 'framer-motion'
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

export function CategoryRow({
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

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={sectionReveal}
      className={`grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24 ${
        reversed ? 'lg:[&>*:first-child]:order-2' : ''
      }`}
    >
      <div>
        <h3 className="text-h2 text-secondary-900">{category.name}</h3>
        <p className="text-body mt-3 max-w-md text-neutral-warm-500">{category.description}</p>
        <div className="mt-8">
          {items.map((item) => (
            <MenuItemRow key={item.id} item={item} onOpen={onOpenItem} />
          ))}
        </div>
      </div>

      <div
        className={`hidden aspect-4/5 w-full overflow-hidden rounded-lg shadow-elato-lg bg-gradient-to-br lg:block ${gradients[index % gradients.length]}`}
        aria-hidden="true"
      />
    </motion.div>
  )
}
