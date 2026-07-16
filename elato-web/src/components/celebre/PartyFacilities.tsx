import { motion } from 'framer-motion'
import { sectionReveal, viewportOnce } from '../../lib/motion'
import gatheringImg from '../../assets/about/gathering.jpeg'
import bgDesktop from '../../assets/newbg/bg.jpg'
import bgMobile from '../../assets/newbg/bg-mb.png'

const partyContent = {
  overline: 'Small Gatherings',
  title: 'A Quiet Room for the Celebrations That Matter',
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
    <section className="relative overflow-hidden py-16 lg:py-32">
      <div className="absolute inset-0 -z-10 bg-cover bg-center sm:hidden" style={{ backgroundImage: `url(${bgMobile})` }} aria-hidden="true" />
      <div className="absolute inset-0 -z-10 hidden bg-cover bg-center sm:block" style={{ backgroundImage: `url(${bgDesktop})` }} aria-hidden="true" />
      <div className="container-elato grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
          className="order-1 lg:order-2"
        >
          <p className="text-caption text-secondary-500">{partyContent.overline}</p>
          <h2 className="text-h2 mt-3 font-sans font-bold text-[#9e7641] lg:text-[44px] lg:leading-[1.1]">{partyContent.title}</h2>
          {partyContent.paragraphs.map((p) => (
            <p key={p} className="text-body mt-4 text-neutral-warm-500">
              {p}
            </p>
          ))}

          <ul className="mt-6 flex flex-wrap gap-3">
            {partyContent.occasions.map((o) => (
              <li
                key={o}
                className="text-caption rounded-full border border-primary-100 bg-[#e7caa0] px-4 py-2 normal-case tracking-normal text-secondary-900"
              >
                {o}
              </li>
            ))}
          </ul>
        </motion.div>

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
            <img src={gatheringImg} alt="A small gathering at Celebré" className="h-full w-full object-cover" />
          </motion.div>

          <div className="absolute -top-4 right-4 rounded-lg bg-surface-elevated px-5 py-3 shadow-elato-lg sm:right-6">
            <p className="text-caption text-secondary-500">{partyContent.capacityLabel}</p>
            <p className="text-h3 mt-1 text-secondary-900">{partyContent.capacityValue}</p>
          </div>

          <div className="absolute -bottom-4 left-4 flex items-center gap-2 rounded-lg bg-surface-elevated px-4 py-3 shadow-elato-lg sm:left-6">
            <svg className="h-5 w-5 shrink-0 text-secondary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" />
            </svg>
            <span className="text-caption whitespace-nowrap normal-case tracking-normal text-secondary-900">
              {partyContent.occasions.length}+ Occasion Types
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
