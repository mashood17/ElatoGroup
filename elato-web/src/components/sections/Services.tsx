import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { ServiceCard } from '../ui/ServiceCard'
import { servicesContent, servicesHeading } from '../../content/siteContent'
import { serviceImages } from '../../content/serviceImages'
import { viewportOnce } from '../../lib/motion'

const routes: Record<string, string> = {
  stay: '/elato-stay',
  celebre: '/elato-celebre',
  events: '/elato-events',
}

const EASE_EDITORIAL = [0.16, 1, 0.3, 1] as const

export function Services() {
  const reduceMotion = useReducedMotion()

  const headingReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: EASE_EDITORIAL },
    },
  }

  const cardsContainer: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.12,
        delayChildren: reduceMotion ? 0 : 0.15,
      },
    },
  }

  const cardReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE_EDITORIAL },
    },
  }

  return (
    <section id="services" className="bg-surface-base py-8 font-sans lg:py-14">
      <div className="container-elato">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={headingReveal}
          className="mx-auto max-w-xl text-center"
        >
          <p className="text-caption text-[#9E7641]">{servicesHeading.overline}</p>
          <span className="mx-auto mt-2 block h-px w-10 bg-[#E7CAA0]" aria-hidden="true" />
          <h2 className="text-h2 font-sans text-[30px] font-bold mt-3 text-[#9E7641] lg:text-[42px]">{servicesHeading.title}</h2>
          <p className="text-body mt-3 text-neutral-warm-500">{servicesHeading.description}</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={cardsContainer}
          className="mt-6 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-3 lg:gap-8"
        >
          {servicesContent.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.descriptor}
              imageSrc={serviceImages[service.id]}
              href={routes[service.id]}
              variants={cardReveal}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
