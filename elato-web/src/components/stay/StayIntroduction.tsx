import { motion } from 'framer-motion'
import stayImage from '../../assets/stay/thestay.png'
import sectionBackground from '../../assets/newbg/bg2.png'
import sectionBackgroundMobile from '../../assets/newbg/bg-mb2.png'
import { SectionBackground } from '../ui/SectionBackground'
import { introduction, stayInfo } from '../../content/stayContent'
import { sectionReveal, staggerContainer, viewportOnce } from '../../lib/motion'

export function StayIntroduction() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-32">
      <SectionBackground image={sectionBackground} mobileImage={sectionBackgroundMobile} />

      <div className="container-elato relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="order-3 lg:order-1 lg:col-start-1 lg:row-span-2 lg:row-start-1"
        >
          <div className="relative mx-auto aspect-4/5 w-full max-w-sm overflow-hidden rounded-[75px] shadow-elato-lg ring-1 ring-secondary-500/40 ring-offset-8 ring-offset-primary-50 lg:max-w-none lg:rounded-[106px]">
            <img
              src={stayImage}
              alt="ELATŌ Stay — the premium 2BHK apartment"
              loading="lazy"
              className="h-full w-full object-cover"
            />
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
    </section>
  )
}
