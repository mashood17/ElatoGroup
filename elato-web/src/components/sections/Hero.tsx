import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Logo } from '../brand/Logo'
import { RingPattern } from '../brand/RingPattern'
import { Button } from '../ui/Button'
import { heroContent } from '../../content/siteContent'
import { heroLoadIn, PARALLAX_MAX_PX } from '../../lib/motion'

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, PARALLAX_MAX_PX])

  const scrollToServices = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="home"
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden bg-surface-base pt-20"
    >
      <RingPattern className="absolute inset-0 h-full w-full text-secondary-500" />

      <div className="container-elato relative grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-[60%_40%] lg:gap-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={heroLoadIn}
          className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left"
        >
          <p className="text-caption text-secondary-500">Crafting Moments Worth Savoring</p>
          <Logo className="text-5xl lg:text-7xl" />
          <p className="text-body-lg max-w-md text-secondary-900">{heroContent.subStatement}</p>
          <Button variant="primary" onClick={scrollToServices}>
            {heroContent.ctaLabel}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ y: parallaxY }}
          className="relative -mt-6 aspect-4/5 w-full max-w-sm justify-self-center overflow-hidden rounded-lg shadow-elato-xl lg:mt-0 lg:max-w-none lg:justify-self-auto"
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
