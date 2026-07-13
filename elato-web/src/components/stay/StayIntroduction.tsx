import { motion } from 'framer-motion'
import { introduction } from '../../content/stayContent'
import { sectionReveal, viewportOnce } from '../../lib/motion'

export function StayIntroduction() {
  return (
    <section className="bg-surface-base py-16 lg:py-32">
      <div className="container-elato grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
        >
          <p className="text-caption text-secondary-500">{introduction.overline}</p>
          <h2 className="text-h2 mt-3 text-secondary-900">{introduction.title}</h2>
          {introduction.paragraphs.map((p) => (
            <p key={p} className="text-body mt-4 text-neutral-warm-500">
              {p}
            </p>
          ))}
          <ul className="mt-8 flex flex-col gap-3">
            {introduction.highlights.map((h) => (
              <li key={h} className="text-body flex items-center gap-3 text-secondary-900">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary-500" aria-hidden="true" />
                {h}
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
            className="h-full w-full bg-gradient-to-br from-primary-300 via-primary-100 to-secondary-500"
            aria-hidden="true"
          />
        </motion.div>
      </div>
    </section>
  )
}
