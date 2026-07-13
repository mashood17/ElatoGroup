import { motion } from 'framer-motion'
import { sectionReveal, viewportOnce } from '../../lib/motion'

const partyContent = {
  overline: 'Small Gatherings',
  title: 'A quiet room for the celebrations that matter',
  paragraphs: [
    'Celebré was never built for crowds — it was built for the table that wants to linger a little longer over cake.',
    'Birthdays, anniversaries, a family catching up, friends marking something small: the room adjusts to the occasion, not the other way around.',
  ],
  capacityLabel: 'Comfortable for up to',
  capacityValue: '40 Guests', // PLACEHOLDER — client-configurable
  occasions: ['Birthdays', 'Anniversaries', 'Family Gatherings', 'Friends Meetups', 'Small Celebrations'],
}

export function PartyFacilities() {
  return (
    <section className="bg-surface-elevated py-16 lg:py-32">
      <div className="container-elato grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
        >
          <p className="text-caption text-secondary-500">{partyContent.overline}</p>
          <h2 className="text-h2 mt-3 text-secondary-900">{partyContent.title}</h2>
          {partyContent.paragraphs.map((p) => (
            <p key={p} className="text-body mt-4 text-neutral-warm-500">
              {p}
            </p>
          ))}

          <div className="mt-8 flex items-baseline gap-3">
            <span className="text-caption text-secondary-500">{partyContent.capacityLabel}</span>
            <span className="text-h3 text-secondary-900">{partyContent.capacityValue}</span>
          </div>

          <ul className="mt-6 flex flex-wrap gap-3">
            {partyContent.occasions.map((o) => (
              <li
                key={o}
                className="text-caption rounded-full border border-primary-100 px-4 py-2 normal-case tracking-normal text-secondary-900"
              >
                {o}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="aspect-4/5 w-full overflow-hidden rounded-lg shadow-elato-lg"
        >
          <div
            className="h-full w-full bg-gradient-to-br from-primary-300 via-primary-100 to-secondary-700"
            aria-hidden="true"
          />
        </motion.div>
      </div>
    </section>
  )
}
