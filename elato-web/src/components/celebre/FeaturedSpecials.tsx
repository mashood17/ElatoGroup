import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { SkeletonCard } from '../ui/SkeletonCard'
import { getSpecials } from '../../lib/menuRepository'
import type { Special } from '../../content/celebreContent'
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
 * isolation principle as StayGallery.
 */
export function FeaturedSpecials() {
  const [specials, setSpecials] = useState<Special[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const requestId = useRef(0)

  const load = () => {
    const id = ++requestId.current
    setLoadError(false)
    setSpecials(null)
    getSpecials()
      .then((data) => {
        if (requestId.current === id) setSpecials(data)
      })
      .catch(() => {
        // Ignore a stale request's rejection (e.g. React StrictMode's double
        // effect invoke, or a fast retry) so it can never overwrite a newer,
        // already-succeeded response — that race was what left this section
        // stuck showing "Try Again" even after the data had loaded fine.
        if (requestId.current === id) setLoadError(true)
      })
  }

  useEffect(() => {
    load()
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
          Featured Specials
        </motion.h2>

        {loadError ? (
          <div className="py-12 text-center">
            <p className="text-body text-neutral-warm-500">Specials couldn&rsquo;t be loaded right now.</p>
            <button type="button" onClick={load} className="text-body mt-3 font-semibold text-secondary-500 hover:underline">
              Try again
            </button>
          </div>
        ) : !specials ? (
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} className="aspect-3/4 w-64 flex-none" />
            ))}
          </div>
        ) : specials.length === 0 ? (
          <p className="rounded-lg bg-primary-50 py-12 text-center text-body text-neutral-warm-500">
            No specials are running right now — check back soon.
          </p>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
          >
            {specials.map((special, i) => (
              <motion.div key={special.id} variants={sectionReveal} className="w-64 flex-none snap-start">
                <Card className="flex h-full flex-col overflow-hidden">
                  <div
                    className={`aspect-square w-full bg-gradient-to-br ${gradients[i % gradients.length]}`}
                    aria-hidden="true"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-h3 text-secondary-900">{special.name}</h3>
                    <p className="text-body mt-2 flex-1 text-neutral-warm-500">{special.description}</p>
                    <p className="text-body mt-3 font-semibold text-secondary-500">₹{special.price}</p>
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
