import { motion } from 'framer-motion'
import { sectionReveal, viewportOnce } from '../../lib/motion'

const quote = 'A good celebration is remembered for how it felt, not how much was in it.'

export function EventsQuote() {
  return (
    <section className="bg-surface-inverse py-20 lg:py-32">
      <motion.p
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={sectionReveal}
        className="text-h2 container-elato max-w-3xl text-center font-display italic text-primary-100"
      >
        &ldquo;{quote}&rdquo;
      </motion.p>
    </section>
  )
}
