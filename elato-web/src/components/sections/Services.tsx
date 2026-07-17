import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { ServiceCard } from '../ui/ServiceCard'
import { servicesContent, servicesHeading } from '../../content/siteContent'
import { serviceImages } from '../../content/serviceImages'
import sectionBackground from '../../assets/newbg/bg2.png'
import sectionBackgroundMobile from '../../assets/newbg/bg-mb2.png'
import { viewportOnce } from '../../lib/motion'
import { useSiteImages } from '../../lib/useSiteImage'
import { useSectionExitFade } from '../../lib/useSectionExitFade'

const routes: Record<string, string> = {
  stay: '/elato-stay',
  celebre: '/elato-celebre',
  events: '/elato-events',
}

// site_content key that the admin's Homepage → Services image slot writes to,
// per service. Falls back to the bundled static asset when unset.
const serviceImageKeys: Record<string, string> = {
  celebre: 'home_services_celebre_image',
  stay: 'home_services_stay_image',
  events: 'home_services_events_image',
}

const EASE_EDITORIAL = [0.16, 1, 0.3, 1] as const

export function Services() {
  const reduceMotion = useReducedMotion()
  const exitFade = useSectionExitFade<HTMLElement>()
  const images = useSiteImages({
    [serviceImageKeys.celebre]: serviceImages.celebre,
    [serviceImageKeys.stay]: serviceImages.stay,
    [serviceImageKeys.events]: serviceImages.events,
  })

  const headingReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: EASE_EDITORIAL },
    },
  }

  // Rounded top corners + a soft ambient shadow give this its "premium
  // sheet" look; the rise itself is driven from outside by
  // HeroServicesReveal, which slides this whole section into place over
  // the pinned hero, so no motion/positioning logic lives here. The shared
  // useSectionExitFade hook (same one every Home section uses) handles the
  // handoff into About as the user scrolls on.
  return (
    <motion.section
      id="services"
      ref={exitFade.ref}
      style={exitFade.style}
      className="relative z-0 overflow-hidden rounded-t-[28px] bg-surface-base py-8 font-sans shadow-[0_-10px_30px_rgba(23,15,10,0.06),0_30px_70px_rgba(23,15,10,0.16)] lg:rounded-t-[48px] lg:py-14"
    >
      <picture>
        <source media="(min-width: 768px)" srcSet={sectionBackground} />
        <img
          src={sectionBackgroundMobile}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
        />
      </picture>

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

        <div className="mt-6 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-3 lg:gap-8">
          {servicesContent.map((service, index) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.descriptor}
              imageSrc={images[serviceImageKeys[service.id]]}
              href={routes[service.id]}
              index={index}
            />
          ))}
        </div>
      </div>
    </motion.section>
  )
}
