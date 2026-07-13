import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { SkeletonCard } from '../ui/SkeletonCard'
import { getFeaturedEvents } from '../../lib/eventsRepository'
import type { FeaturedEvent } from '../../content/eventsContent'
import { sectionReveal, staggerContainer, viewportOnce } from '../../lib/motion'

const gradients = [
  'from-primary-300 to-secondary-500',
  'from-secondary-500 to-primary-100',
  'from-primary-100 to-secondary-700',
  'from-secondary-700 to-primary-300',
]

/**
 * Isolated and data-driven on purpose — swappable for a specific 21st.dev
 * card reference later without touching the rest of the page, same
 * isolation principle as FeaturedSpecials/StayGallery.
 */
export function FeaturedEvents() {
  const [events, setEvents] = useState<FeaturedEvent[] | null>(null)

  useEffect(() => {
    getFeaturedEvents().then(setEvents)
  }, [])

  return (
    <section className="bg-surface-base py-16 lg:py-32">
      <div className="container-elato">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
          className="text-h2 mb-12 text-center text-secondary-900"
        >
          Featured Celebrations
        </motion.h2>

        {!events ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} className="aspect-3/4" />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {events.map((event, i) => (
              <motion.div key={event.id} variants={sectionReveal}>
                <Card className="flex h-full flex-col overflow-hidden">
                  <div
                    className={`aspect-4/3 w-full bg-gradient-to-br ${gradients[i % gradients.length]}`}
                    aria-hidden="true"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-h3 text-secondary-900">{event.title}</h3>
                    <p className="text-body mt-2 flex-1 text-neutral-warm-500">{event.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-caption text-secondary-500">{event.capacity}</span>
                      {event.startingPrice && (
                        <span className="text-body font-semibold text-secondary-900">
                          From ₹{event.startingPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
