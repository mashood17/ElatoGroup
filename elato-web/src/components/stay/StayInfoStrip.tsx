import { motion } from 'framer-motion'
import { stayInfo } from '../../content/stayContent'
import { sectionReveal, staggerContainer, viewportOnce } from '../../lib/motion'

export function StayInfoStrip() {
  return (
    <section className="border-y border-primary-100 bg-surface-base py-10">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer}
        className="container-elato grid grid-cols-2 gap-8 lg:grid-cols-4"
      >
        {stayInfo.map((item) => (
          <motion.div key={item.label} variants={sectionReveal} className="text-center lg:text-left">
            <p className="text-caption text-secondary-500">{item.label}</p>
            <p className="text-body mt-1 text-secondary-900">{item.value}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
