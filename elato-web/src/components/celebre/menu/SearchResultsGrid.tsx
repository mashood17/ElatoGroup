import { motion } from 'framer-motion'
import { Card } from '../../ui/Card'
import type { MenuItem } from '../../../content/celebreContent'
import { sectionReveal, staggerContainer } from '../../../lib/motion'

export function SearchResultsGrid({
  items,
  loading,
  query,
  onOpenItem,
}: {
  items: MenuItem[]
  loading: boolean
  query: string
  onOpenItem: (id: string) => void
}) {
  if (loading) {
    return <p className="text-body py-16 text-center text-neutral-warm-500">Searching…</p>
  }

  if (items.length === 0) {
    return (
      <p className="text-body py-16 text-center text-neutral-warm-500">
        No items match &ldquo;{query}&rdquo; — try a different search or browse by category.
      </p>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="grid grid-cols-1 gap-4 py-12 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((item) => (
        <motion.button
          key={item.id}
          type="button"
          onClick={() => onOpenItem(item.id)}
          variants={sectionReveal}
          className="text-left"
        >
          <Card className="p-5">
            <h3 className="text-h3 text-secondary-900">{item.name}</h3>
            <p className="text-body mt-2 text-neutral-warm-500">{item.description}</p>
            <p className="text-body mt-3 font-semibold text-secondary-500">₹{item.price}</p>
          </Card>
        </motion.button>
      ))}
    </motion.div>
  )
}
