import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { SkeletonCard } from '../ui/SkeletonCard'
import { getFeaturedEvents } from '../../lib/eventsRepository'
import type { FeaturedEvent } from '../../content/eventsContent'
import { sectionReveal, staggerContainer, viewportOnce } from '../../lib/motion'
import { EventDetailModal } from './EventDetailModal'

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
  const [openEvent, setOpenEvent] = useState<FeaturedEvent | null>(null)
  const [loadError, setLoadError] = useState(false)

  const load = () => {
    setLoadError(false)
    setEvents(null)
    getFeaturedEvents()
      .then(setEvents)
      .catch(() => setLoadError(true))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <section className="relative z-0 overflow-hidden rounded-t-[28px] bg-surface-base py-16 shadow-[0_-10px_30px_rgba(23,15,10,0.06),0_30px_70px_rgba(23,15,10,0.16)] lg:rounded-t-[48px] lg:py-32">
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

        {loadError ? (
          <div className="py-16 text-center">
            <p className="text-body text-neutral-warm-500">Celebrations couldn&rsquo;t be loaded right now.</p>
            <button type="button" onClick={load} className="text-body mt-3 font-semibold text-secondary-500 hover:underline">
              Try again
            </button>
          </div>
        ) : !events ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} className="aspect-3/4" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="rounded-lg bg-primary-50 py-16 text-center text-body text-neutral-warm-500">
            Celebration packages are being updated — check back shortly, or enquire directly below.
          </p>
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
                <button
                  type="button"
                  onClick={() => setOpenEvent(event)}
                  className="block w-full text-left focus-visible:outline-none"
                  aria-haspopup="dialog"
                >
                  <Card className="flex h-full flex-col overflow-hidden transition-transform duration-300 ease-out hover:-translate-y-1">
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
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <EventDetailModal event={openEvent} onClose={() => setOpenEvent(null)} />
    </section>
  )
}
