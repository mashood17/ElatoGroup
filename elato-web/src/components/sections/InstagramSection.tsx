import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SkeletonCard } from '../ui/SkeletonCard'
import { instagramItems, businessInfo } from '../../content/siteContent'
import { sectionReveal, viewportOnce } from '../../lib/motion'

type LoadState = 'loading' | 'ready' | 'empty'

export function InstagramSection() {
  const [state, setState] = useState<LoadState>('loading')

  useEffect(() => {
    // Simulates the async fetch to GET /api/v1/instagram/latest (Ch. 41).
    const timer = setTimeout(() => {
      setState(instagramItems.length > 0 ? 'ready' : 'empty')
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section id="instagram" className="bg-surface-base py-12 lg:py-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={sectionReveal}
        className="container-elato"
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-h2 text-secondary-900">Follow @{businessInfo.instagramHandle.replace('@', '')}</h2>
          <a href={businessInfo.instagramUrl} className="text-body font-semibold text-secondary-500 hover:underline">
            View on Instagram →
          </a>
        </div>

        {state === 'loading' && (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} className="aspect-square w-60 flex-none lg:w-70" />
            ))}
          </div>
        )}

        {state === 'ready' && (
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {instagramItems.slice(0, 8).map((item) => (
              <a
                key={item.id}
                href={item.permalink}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square w-60 flex-none snap-start overflow-hidden rounded-lg bg-gradient-to-br from-primary-300 to-secondary-500 shadow-elato-sm lg:w-70"
              >
                <span
                  className="absolute inset-0 flex items-center justify-center text-3xl text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                >
                  ▶
                </span>
                <span className="sr-only">{item.caption}</span>
              </a>
            ))}
          </div>
        )}

        {state === 'empty' && (
          <a
            href={businessInfo.instagramUrl}
            className="block rounded-lg bg-primary-50 py-12 text-center text-body font-semibold text-secondary-500 hover:underline"
          >
            View us on Instagram
          </a>
        )}
      </motion.div>
    </section>
  )
}
