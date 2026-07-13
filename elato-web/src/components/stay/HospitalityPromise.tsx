import { motion } from 'framer-motion'
import { hospitalityPromise } from '../../content/stayContent'
import { sectionReveal, viewportOnce } from '../../lib/motion'

export function HospitalityPromise() {
  return (
    <section className="bg-surface-inverse py-20 lg:py-32">
      <motion.p
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={sectionReveal}
        className="text-h2 container-elato max-w-3xl text-center font-display italic text-primary-100"
      >
        &ldquo;{hospitalityPromise}&rdquo;
      </motion.p>
    </section>
  )
}
