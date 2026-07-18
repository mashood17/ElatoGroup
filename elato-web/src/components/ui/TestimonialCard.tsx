import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { Quote } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface TestimonialItem {
  id: string
  author: string
  rating: number | null
  text: string
  /** ISO date (YYYY-MM-DD) the review was posted. */
  reviewDate?: string
}

function formatReviewedDate(reviewDate: string): string {
  return new Date(reviewDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function Stars({ count, size = 16 }: { count: number; size?: number }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < count ? '#9E7641' : 'none'}
          stroke="#9E7641"
          aria-hidden="true"
        >
          <path strokeWidth="1.5" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

/** Single review, presented directly on the section background — no card
 * box, no border, no avatar — quote, stars, and identity in one centered
 * editorial block. Each element (quote icon, text, rating, identity) is its
 * own motion node with no explicit initial/animate of its own, so it
 * inherits the enter/center/exit variant + stagger timing driven by the
 * AnimatePresence wrapper in ReviewsSection — the crossfade and the
 * element-by-element reveal are one orchestrated transition, not two. */
export function TestimonialCard({ item, className }: { item: TestimonialItem; className?: string }) {
  const reduceMotion = useReducedMotion()
  const reviewedDate = item.reviewDate ? formatReviewedDate(item.reviewDate) : null

  const itemFade: Variants = {
    enter: { opacity: 0, y: reduceMotion ? 0 : 10 },
    center: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
    exit: { opacity: 0, y: reduceMotion ? 0 : -6 },
  }

  return (
    <div className={cn('mx-auto flex flex-col items-center text-center', className)}>
      <motion.div variants={itemFade}>
        <Quote className="h-5 w-5 text-[#E7CAA0]" fill="#E7CAA0" fillOpacity={0.6} aria-hidden="true" />
      </motion.div>

      <motion.p
        variants={itemFade}
        className="mx-auto mt-6 max-w-[42ch] text-balance font-serif-italic text-[20px] italic leading-[1.8] text-secondary-900 sm:mt-7 sm:text-[24px] sm:leading-[1.75] lg:max-w-[58ch]"
      >
        {item.text}
      </motion.p>

      {item.rating != null && (
        <motion.div variants={itemFade} className="mt-6">
          <Stars count={item.rating} />
        </motion.div>
      )}

      <motion.div variants={itemFade} className="mt-5">
        <p className="text-sm font-semibold text-secondary-900">{item.author}</p>
        {reviewedDate && <p className="mt-1.5 text-caption text-neutral-warm-500">Reviewed · {reviewedDate}</p>}
      </motion.div>
    </div>
  )
}
