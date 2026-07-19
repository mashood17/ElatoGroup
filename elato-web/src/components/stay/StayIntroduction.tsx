import { motion, useReducedMotion, type Variants } from 'framer-motion'
import sectionBackground from '../../assets/newbg/bg2.webp'
import sectionBackgroundMobile from '../../assets/newbg/bg-mb2.webp'
import { SectionBackground } from '../ui/SectionBackground'
import { SiteImage } from '../ui/SiteImage'
import { introduction, stayInfo } from '../../content/stayContent'
import { sectionReveal, staggerContainer, viewportOnce } from '../../lib/motion'
import { useSiteImage } from '../../lib/useSiteImage'
import { useSectionExitFade } from '../../lib/useSectionExitFade'

// Same cinematic left-entrance treatment as Home's About section image card.
const imageViewport = { once: true, amount: 0.28 }

export function StayIntroduction() {
  const imageSrc = useSiteImage('stay_intro_image', '')
  const exitFade = useSectionExitFade<HTMLElement>()
  const reduceMotion = useReducedMotion()

  const imageReveal: Variants = {
    hidden: {
      opacity: 0,
      x: reduceMotion ? 0 : -80,
      scale: reduceMotion ? 1 : 0.96,
      filter: reduceMotion ? 'blur(0px)' : 'blur(8px)',
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: { type: 'spring', duration: 0.9, bounce: 0 },
    },
  }

  return (
    <motion.section ref={exitFade.ref} style={exitFade.style} className="relative overflow-hidden py-16 lg:py-32">
      <SectionBackground image={sectionBackground} mobileImage={sectionBackgroundMobile} />

      <div className="container-elato relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={imageViewport}
          variants={imageReveal}
          className="order-3 lg:order-1 lg:col-start-1 lg:row-span-2 lg:row-start-1"
        >
          <div className="relative mx-auto aspect-4/5 w-full max-w-sm lg:max-w-none">
            <div
              className="absolute -inset-3 rounded-[44px] rounded-bl-[130px] bg-primary-50/80"
              aria-hidden="true"
            />
            <div className="relative h-full w-full overflow-hidden rounded-[36px] rounded-bl-[110px] border-[10px] border-secondary-900 ring-4 ring-surface-elevated shadow-elato-lg lg:rounded-[48px] lg:rounded-bl-[150px] lg:border-[14px]">
              <SiteImage
                src={imageSrc}
                alt="ELATŌ Stay — the premium 2BHK apartment"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
          className="order-1 lg:order-2 lg:col-start-2 lg:row-start-1"
        >
          <p className="text-caption text-secondary-500">{introduction.overline}</p>
          <h2 className="text-h2 mt-3 font-sans font-bold text-[#9e7641]">{introduction.title}</h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionReveal}
          className="order-2 lg:order-2 lg:col-start-2 lg:row-start-2"
        >
          {introduction.paragraphs.map((p) => (
            <p key={p} className="text-body mt-4 text-neutral-warm-500 first:mt-0">
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

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer}
            className="mt-8 grid grid-cols-2 gap-8 border-t border-secondary-500/30 pt-6"
          >
            {stayInfo.map((item) => (
              <motion.div key={item.label} variants={sectionReveal}>
                <p className="text-caption text-secondary-500">{item.label}</p>
                <p className="text-body mt-1 text-secondary-900">{item.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}
