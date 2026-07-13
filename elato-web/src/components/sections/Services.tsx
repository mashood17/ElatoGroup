import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { servicesContent } from '../../content/siteContent'
import { sectionReveal, staggerContainer, viewportOnce } from '../../lib/motion'

const gradients: Record<string, string> = {
  stay: 'from-secondary-500 via-primary-100 to-primary-300',
  celebre: 'from-primary-300 via-primary-100 to-secondary-500',
  events: 'from-secondary-700 via-secondary-500 to-primary-300',
}

const routes: Partial<Record<string, string>> = {
  stay: '/elato-stay',
  celebre: '/elato-celebre',
  events: '/elato-events',
}

const MotionLink = motion(Link)

export function Services() {
  return (
    <section id="services" className="bg-surface-base py-12 lg:py-24">
      <div className="container-elato">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {servicesContent.map((service) => {
            const route = routes[service.id]
            const cardBody = (
              <Card className="overflow-hidden">
                <div
                  className={`aspect-3/4 w-full bg-gradient-to-br ${gradients[service.id]}`}
                  aria-hidden="true"
                />
                <div className="p-6">
                  <h3 className="text-h3 text-secondary-900">{service.title}</h3>
                  <p className="text-body mt-2 text-neutral-warm-500">{service.descriptor}</p>
                  <span className="text-caption mt-4 inline-flex items-center gap-1 text-secondary-500">
                    Explore
                    <span className="transition-transform duration-200 ease-out group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </Card>
            )

            return route ? (
              <MotionLink key={service.id} to={route} variants={sectionReveal} className="group block">
                {cardBody}
              </MotionLink>
            ) : (
              <motion.a
                key={service.id}
                href="#services"
                onClick={(e) => e.preventDefault()}
                aria-disabled="true"
                variants={sectionReveal}
                className="group block"
              >
                {cardBody}
              </motion.a>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
