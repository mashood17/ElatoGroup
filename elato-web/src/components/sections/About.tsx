import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { aboutContent } from '../../content/siteContent'
import { sectionReveal, staggerContainer, viewportOnce } from '../../lib/motion'

const cardGradients = [
  'from-primary-300 to-secondary-500',
  'from-secondary-500 to-primary-100',
  'from-primary-100 to-secondary-700',
]

const rotations = ['-rotate-4', 'rotate-0', 'rotate-4']

export function About() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [activeDot, setActiveDot] = useState(0)

  const onScroll = () => {
    const el = scrollerRef.current
    if (!el) return
    const index = Math.round(el.scrollLeft / el.clientWidth)
    setActiveDot(index)
  }

  return (
    <section id="about" className="bg-surface-base py-12 lg:py-24">
      <div className="container-elato grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Desktop layered composition */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="relative hidden h-96 lg:block"
        >
          {cardGradients.map((gradient, i) => (
            <motion.div
              key={i}
              variants={sectionReveal}
              className={`absolute h-72 w-56 rounded-lg bg-gradient-to-br shadow-elato-lg ${gradient} ${rotations[i]}`}
              style={{ left: `${i * 15}%`, top: `${i * 8}%`, zIndex: i }}
              aria-hidden="true"
            />
          ))}
        </motion.div>

        {/* Mobile carousel */}
        <div className="lg:hidden">
          <div
            ref={scrollerRef}
            onScroll={onScroll}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
          >
            {cardGradients.map((gradient, i) => (
              <div
                key={i}
                className={`aspect-3/4 w-full flex-none snap-center rounded-lg bg-gradient-to-br shadow-elato-md ${gradient}`}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {cardGradients.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${
                  activeDot === i ? 'bg-secondary-500' : 'bg-primary-100'
                }`}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
          className="max-w-xl px-6 lg:px-0"
        >
          <p className="text-caption text-secondary-500">{aboutContent.overline}</p>
          <h2 className="text-h2 mt-2 text-secondary-900">{aboutContent.title}</h2>
          {aboutContent.paragraphs.map((p) => (
            <p key={p} className="text-body mt-4 text-neutral-warm-500">
              {p}
            </p>
          ))}
          <a href="#about" className="text-body mt-6 inline-block font-semibold text-secondary-500 hover:underline">
            {aboutContent.ctaLabel} →
          </a>
        </motion.div>
      </div>
    </section>
  )
}
