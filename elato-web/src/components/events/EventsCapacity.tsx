import { motion } from 'framer-motion'
import { EVENTS_HALL_CAPACITY_MIN, EVENTS_HALL_CAPACITY_MAX } from '../../content/eventsContent'
import { sectionReveal, viewportOnce } from '../../lib/motion'

/** PRD Ch. 15 — prominent capacity stat block, placed directly beneath the hero. */
export function EventsCapacity() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={sectionReveal}
      className="border-y border-primary-100 bg-surface-base py-10"
    >
      <div className="container-elato flex flex-col items-center gap-2 text-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-secondary-500" aria-hidden="true">
          <path strokeWidth="1.5" d="M17 20c0-2.76-2.24-5-5-5s-5 2.24-5 5M12 12a4 4 0 100-8 4 4 0 000 8zM21 20c0-2-1.5-4-3.5-4.5M19 12a3 3 0 100-6M3 20c0-2 1.5-4 3.5-4.5M5 12a3 3 0 110-6" />
        </svg>
        <p className="text-h2 text-secondary-900">
          Up to {EVENTS_HALL_CAPACITY_MIN}–{EVENTS_HALL_CAPACITY_MAX} Guests
        </p>
        <p className="text-body text-neutral-warm-500">One hall, set for your occasion.</p>
      </div>
    </motion.section>
  )
}
