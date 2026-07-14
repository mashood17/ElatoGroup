import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { HeroBackground } from '../brand/HeroBackground'
import { heroLoadIn, staggerContainer, PARALLAX_MAX_PX } from '../../lib/motion'

const celebreHero = {
  wordmarkLine1: 'ELATŌ',
  wordmarkLine2: 'CELEBRÉ',
  statement: 'Signature ice creams, sundaes, cakes and shakes — desserts as the centerpiece, not an afterthought.',
}

export function CelebreHero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const logoY = useTransform(scrollYProgress, [0, 1], [0, PARALLAX_MAX_PX * 0.15])
  const imageY = useTransform(scrollYProgress, [0, 1], [0, PARALLAX_MAX_PX])

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden bg-sand pt-20"
    >
      <HeroBackground targetRef={ref} />
      <div className="container-elato relative grid grid-cols-1 items-center gap-16 py-16 lg:grid-cols-[60%_40%] lg:gap-8">
        <motion.div
          style={{ y: logoY }}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center gap-8 text-center lg:items-start lg:text-left"
        >
          <motion.h1 variants={heroLoadIn} className="flex flex-col gap-2">
            <span className="font-display text-6xl font-semibold uppercase tracking-[0.08em] text-secondary-500 lg:text-8xl">
              {celebreHero.wordmarkLine1}
            </span>
            <span className="text-caption pl-1 text-neutral-warm-500 lg:text-base">
              {celebreHero.wordmarkLine2}
            </span>
          </motion.h1>
          <motion.p variants={heroLoadIn} className="text-body-lg max-w-md text-secondary-900">
            {celebreHero.statement}
          </motion.p>
        </motion.div>

        <motion.div
          style={{ y: imageY }}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="relative aspect-4/5 w-full max-w-sm justify-self-center overflow-hidden rounded-lg shadow-elato-xl lg:max-w-none lg:justify-self-auto"
        >
          <div
            className="h-full w-full bg-gradient-to-br from-secondary-500 via-primary-100 to-primary-300"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0"
            aria-hidden="true"
          />
        </motion.div>
      </div>
    </section>
  )
}
