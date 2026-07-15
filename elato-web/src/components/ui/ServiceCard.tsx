import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { cn } from '../../lib/cn'

/**
 * Fixed-height image card (not aspect-ratio-driven — that made cards balloon
 * on wide columns) with the title/description/CTA sitting on a contained
 * dark scrim at the bottom, not a full-bleed brand-colored gradient. CTA is
 * a plain text link (no pill/border/blur chrome) — matches how Aman,
 * Rosewood and Four Seasons treat card CTAs, which read as editorial rather
 * than app UI. Strict two-tone brand palette (primary #9E7641, secondary
 * #E7CAA0) for text/CTA accents only. Entrance motion is driven by the
 * parent's stagger container via the `variants` prop.
 */
interface ServiceCardProps {
  title: string
  description: string
  imageSrc: string
  href: string
  variants?: Variants
  className?: string
}

export function ServiceCard({ title, description, imageSrc, href, variants, className }: ServiceCardProps) {
  return (
    <motion.div variants={variants} className={cn('group h-full', className)}>
      <Link
        to={href}
        className="relative block h-[380px] w-full overflow-hidden rounded-md font-sans shadow-[0_4px_14px_-8px_rgba(58,46,30,0.3)] transition-shadow duration-500 ease-out hover:shadow-[0_10px_26px_-10px_rgba(58,46,30,0.35)] sm:h-[420px] lg:h-[460px]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${imageSrc})` }}
          aria-hidden="true"
        />

        <div className="absolute inset-x-0 bottom-0 flex flex-col bg-gradient-to-t from-ink/85 via-ink/45 to-transparent p-6 pt-16 lg:p-8 lg:pt-20">
          <h3 className="text-2xl font-semibold leading-tight text-[#E7CAA0] lg:text-3xl">
            {title}
          </h3>
          <p className="text-body mt-2 max-w-[30ch] text-[#E7CAA0]/85">{description}</p>

          <span className="text-caption mt-6 inline-flex w-fit items-center gap-2 text-[#E7CAA0]">
            <span className="border-b border-[#E7CAA0]/50 pb-0.5 transition-colors duration-300 ease-out group-hover:border-[#E7CAA0]">
              Explore
            </span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
