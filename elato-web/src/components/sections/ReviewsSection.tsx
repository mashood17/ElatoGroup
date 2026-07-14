import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { SkeletonCard } from '../ui/SkeletonCard'
import { Button } from '../ui/Button'
import { aggregateRating, businessInfo } from '../../content/siteContent'
import { getFeaturedReviews, type Review } from '../../lib/reviewsRepository'
import { sectionReveal, staggerContainer, viewportOnce } from '../../lib/motion'

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1 text-secondary-500" role="img" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < count ? 'currentColor' : 'none'} stroke="currentColor" aria-hidden="true">
          <path strokeWidth="1.5" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

type LoadState = 'loading' | 'ready' | 'empty' | 'error'

export function ReviewsSection() {
  const [state, setState] = useState<LoadState>('loading')
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    let cancelled = false
    getFeaturedReviews()
      .then((rows) => {
        if (cancelled) return
        setReviews(rows)
        setState(rows.length > 0 ? 'ready' : 'empty')
      })
      .catch(() => {
        if (!cancelled) setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section id="reviews" className="bg-surface-base py-12 lg:py-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={sectionReveal}
        className="container-elato"
      >
        <div className="mb-8 text-center">
          <h2 className="text-h2 text-secondary-900">What Guests Say</h2>
          <p className="text-body mt-2 text-neutral-warm-500">
            {aggregateRating.rating} out of {aggregateRating.count.toLocaleString()} reviews on Google
          </p>
        </div>

        {state === 'loading' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} className="h-48" />
            ))}
          </div>
        )}

        {state === 'ready' && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {reviews.slice(0, 3).map((review) => (
              <motion.div key={review.id} variants={sectionReveal}>
                <Card hoverable={false} className="flex h-full flex-col gap-4 p-6">
                  <Stars count={review.rating} />
                  <p className="text-body flex-1 text-secondary-900">&ldquo;{review.text}&rdquo;</p>
                  <span className="text-caption text-neutral-warm-500">{review.author}</span>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {state === 'empty' && (
          <a
            href={businessInfo.googleReviewsUrl}
            className="block rounded-lg bg-primary-50 py-12 text-center text-body font-semibold text-secondary-500 hover:underline"
          >
            Read our reviews on Google
          </a>
        )}

        {state === 'error' && (
          <p className="rounded-lg bg-primary-50 py-12 text-center text-body text-neutral-warm-500">
            Reviews are taking a moment to load —{' '}
            <a href={businessInfo.googleReviewsUrl} className="font-semibold text-secondary-500 hover:underline">
              see them on Google
            </a>{' '}
            in the meantime.
          </p>
        )}

        <div className="mt-8 text-center">
          <Button as="a" href={businessInfo.googleReviewsUrl} variant="secondary">
            See All Reviews on Google
          </Button>
        </div>
      </motion.div>
    </section>
  )
}
