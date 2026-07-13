import { motion } from 'framer-motion'
import { sectionReveal, viewportOnce } from '../../lib/motion'

const experience = {
  overline: 'The Experience',
  title: 'A celebration, hosted rather than rented',
  paragraphs: [
    'An event at ELATŌ is not a hall booked by the hour — it is a room prepared for one occasion, once, with nothing borrowed from the celebration before it.',
    'Every detail is arranged around the people arriving, not a standard package: the lighting, the pacing, the dessert course that closes the evening.',
  ],
  highlights: [
    'Elegant venue',
    'Premium hospitality',
    'Personalized celebrations',
    'Curated dessert experiences',
    'Luxury ambience',
    'Professional service',
    'Memorable moments',
  ],
}

export function EventExperience() {
  return (
    <section className="bg-surface-elevated py-16 lg:py-32">
      <div className="container-elato grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="aspect-4/5 w-full overflow-hidden rounded-lg shadow-elato-lg"
        >
          <div
            className="h-full w-full bg-gradient-to-br from-secondary-500 via-primary-100 to-secondary-700"
            aria-hidden="true"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
        >
          <p className="text-caption text-secondary-500">{experience.overline}</p>
          <h2 className="text-h2 mt-3 text-secondary-900">{experience.title}</h2>
          {experience.paragraphs.map((p) => (
            <p key={p} className="text-body mt-4 text-neutral-warm-500">
              {p}
            </p>
          ))}

          <ul className="mt-8 grid grid-cols-2 gap-3">
            {experience.highlights.map((h) => (
              <li key={h} className="text-body flex items-center gap-2 text-secondary-900">
                <span className="h-1.5 w-1.5 flex-none rounded-full bg-secondary-500" aria-hidden="true" />
                {h}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
