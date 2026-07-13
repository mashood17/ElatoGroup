import { motion } from 'framer-motion'
import { amenities } from '../../content/stayContent'
import { sectionReveal, staggerContainer, viewportOnce } from '../../lib/motion'

function AmenityMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14" cy="14" r="3" fill="currentColor" />
    </svg>
  )
}

export function Amenities() {
  return (
    <section className="bg-surface-elevated py-16 lg:py-32">
      <div className="container-elato">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
          className="text-h2 mb-12 text-center text-secondary-900"
        >
          Every Detail, Considered
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="grid grid-cols-2 gap-8 lg:grid-cols-4"
        >
          {amenities.map((amenity) => (
            <motion.div
              key={amenity}
              variants={sectionReveal}
              className="flex flex-col items-center gap-3 text-center text-secondary-500"
            >
              <AmenityMark />
              <span className="text-body text-secondary-900">{amenity}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
