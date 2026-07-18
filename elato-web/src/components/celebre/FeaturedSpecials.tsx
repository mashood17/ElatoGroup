import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { SkeletonCard } from '../ui/SkeletonCard'
import CardFanCarousel from '../ui/CardFanCarousel'
import { SpecialDetailModal } from './SpecialDetailModal'
import { getSpecials } from '../../lib/menuRepository'
import type { Special } from '../../content/celebreContent'
import { sectionReveal, viewportOnce } from '../../lib/motion'
import { useSectionExitFade } from '../../lib/useSectionExitFade'
import bgDesktop from '../../assets/newbg/bg2.webp'
import bgMobile from '../../assets/newbg/bg-mb2.webp'

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
  const [activeSpecial, setActiveSpecial] = useState<Special | null>(null)
  const requestId = useRef(0)
  const exitFade = useSectionExitFade<HTMLElement>()

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
    <motion.section ref={exitFade.ref} style={exitFade.style} className="relative overflow-hidden py-16 lg:py-32">
      <div className="absolute inset-0 -z-10 bg-cover bg-center sm:hidden" style={{ backgroundImage: `url(${bgMobile})` }} aria-hidden="true" />
      <div className="absolute inset-0 -z-10 hidden bg-cover bg-center sm:block" style={{ backgroundImage: `url(${bgDesktop})` }} aria-hidden="true" />
      <div className="container-elato">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
          className="mb-6 text-center sm:mb-6"
        >
          <p className="text-caption text-secondary-500">Signature Indulgences</p>
          <h2 className="text-h2 mt-3 font-sans font-bold text-[#9e7641] lg:text-[44px] lg:leading-[1.1]">Handcrafted Creations, Curated to Delight</h2>
        </motion.div>

        {loadError ? (
          <div className="py-12 text-center">
            <p className="text-body text-neutral-warm-500">Specials couldn&rsquo;t be loaded right now.</p>
            <button type="button" onClick={load} className="text-body mt-3 font-semibold text-secondary-500 hover:underline">
              Try again
            </button>
          </div>
        ) : !specials ? (
          <div className="flex justify-center gap-6 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} className="aspect-3/4 w-40 flex-none sm:w-48" />
            ))}
          </div>
        ) : specials.length === 0 ? (
          <p className="rounded-lg bg-primary-50 py-12 text-center text-body text-neutral-warm-500">
            No specials are running right now — check back soon.
          </p>
        ) : null}
      </div>

      {specials && specials.length > 0 && (
        <motion.div initial="hidden" whileInView="visible" viewport={viewportOnce} variants={sectionReveal}>
          <CardFanCarousel
            cards={specials.map((special, i) => ({
              id: special.id,
              name: special.name,
              description: special.description,
              price: special.price,
              gradientClass: gradients[i % gradients.length],
              imageUrl: special.imageUrl,
              onClick: () => setActiveSpecial(special),
            }))}
          />
        </motion.div>
      )}

      <SpecialDetailModal special={activeSpecial} onClose={() => setActiveSpecial(null)} />
    </motion.section>
  )
}
