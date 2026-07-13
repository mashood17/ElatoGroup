import { motion } from 'framer-motion'
import { sectionReveal, viewportOnce } from '../../lib/motion'

const craftsmanship = {
  overline: 'Craftsmanship',
  title: 'Made slowly, on purpose',
  paragraphs: [
    'Every ice cream is churned in small batches, every cake sliced from one baked that morning — nothing is stretched to last, and nothing is rushed to arrive.',
    'The recipes change with the season, not the promotion calendar. What stays constant is the standard.',
  ],
}

export function Craftsmanship() {
  return (
    <section className="bg-surface-base py-16 lg:py-32">
      <div className="container-elato grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="order-2 aspect-4/5 w-full overflow-hidden rounded-lg shadow-elato-lg lg:order-1"
        >
          <div
            className="h-full w-full bg-gradient-to-br from-secondary-700 via-secondary-500 to-primary-100"
            aria-hidden="true"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
          className="order-1 lg:order-2"
        >
          <p className="text-caption text-secondary-500">{craftsmanship.overline}</p>
          <h2 className="text-h2 mt-3 text-secondary-900">{craftsmanship.title}</h2>
          {craftsmanship.paragraphs.map((p) => (
            <p key={p} className="text-body mt-4 text-neutral-warm-500">
              {p}
            </p>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
