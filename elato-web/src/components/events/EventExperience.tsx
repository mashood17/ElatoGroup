import { motion } from 'framer-motion'
import { EVENTS_HALL_CAPACITY_MIN, EVENTS_HALL_CAPACITY_MAX, featuredEvents } from '../../content/eventsContent'
import { sectionReveal, viewportOnce } from '../../lib/motion'
import eventsImg from '../../assets/services/events.png'
import bgDesktop from '../../assets/newbg/bg2.png'
import bgMobile from '../../assets/newbg/bg-mb2.png'

const experience = {
  overline: 'The Experience',
  title: 'Where Every Celebration Becomes a Lasting Memory',
  paragraphs: [
    'An event at ELATŌ is not a hall booked by the hour — it is a room prepared for one occasion, once, with nothing borrowed from the celebration before it.',
    'Every detail is arranged around the people arriving, not a standard package: the lighting, the pacing, the dessert course that closes the evening.',
  ],
  capacityLabel: 'Comfortable for up to',
  capacityValue: `${EVENTS_HALL_CAPACITY_MAX} Guests`,
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
    <section className="relative overflow-hidden pb-16 pt-16 lg:pb-20 lg:pt-32">
      <div className="absolute inset-0 -z-10 bg-cover bg-center sm:hidden" style={{ backgroundImage: `url(${bgMobile})` }} aria-hidden="true" />
      <div className="absolute inset-0 -z-10 hidden bg-cover bg-center sm:block" style={{ backgroundImage: `url(${bgDesktop})` }} aria-hidden="true" />
      <div className="container-elato grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:items-start">
        <div className="relative order-2 mx-auto mt-6 w-full max-w-sm lg:order-1 lg:mt-0 lg:max-w-none">
          <div className="pointer-events-none absolute -left-3 -top-3 h-full w-full rounded-2xl border border-secondary-500/25" aria-hidden="true" />

          <div className="pointer-events-none absolute -right-2 -top-4 grid grid-cols-5 gap-1.5" aria-hidden="true">
            {Array.from({ length: 15 }).map((_, i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-secondary-500/40" />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-elato-lg"
          >
            <img src={eventsImg} alt="An event hosted at ELATŌ" className="h-full w-full object-cover" />
          </motion.div>

          <div className="absolute -top-4 right-4 rounded-lg bg-surface-elevated px-5 py-3 shadow-elato-lg sm:right-6">
            <p className="text-caption text-secondary-500">{experience.capacityLabel}</p>
            <p className="text-h3 mt-1 text-secondary-900">{experience.capacityValue}</p>
          </div>

          <div className="absolute -bottom-4 left-4 flex items-center gap-2 rounded-lg bg-surface-elevated px-4 py-3 shadow-elato-lg sm:left-6">
            <svg className="h-5 w-5 shrink-0 text-secondary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" />
            </svg>
            <span className="text-caption whitespace-nowrap normal-case tracking-normal text-secondary-900">
              {featuredEvents.length}+ Celebration Types
            </span>
          </div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
          className="order-1 lg:order-2"
        >
          <p className="text-caption text-secondary-500">{experience.overline}</p>
          <h2 className="text-h2 mt-3 font-sans font-bold text-[#9e7641] lg:text-[44px] lg:leading-[1.1]">{experience.title}</h2>
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

          <div className="mt-8 flex items-center gap-3 border-t border-primary-100 pt-8">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="shrink-0 text-secondary-500" aria-hidden="true">
              <path strokeWidth="1.5" d="M17 20c0-2.76-2.24-5-5-5s-5 2.24-5 5M12 12a4 4 0 100-8 4 4 0 000 8zM21 20c0-2-1.5-4-3.5-4.5M19 12a3 3 0 100-6M3 20c0-2 1.5-4 3.5-4.5M5 12a3 3 0 110-6" />
            </svg>
            <div>
              <p className="text-h3 text-secondary-900">
                Up to {EVENTS_HALL_CAPACITY_MIN}–{EVENTS_HALL_CAPACITY_MAX} Guests
              </p>
              <p className="text-body text-neutral-warm-500">One hall, set for your occasion.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
