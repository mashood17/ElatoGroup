import { cn } from '../../lib/cn'

export interface TestimonialItem {
  id: string
  author: string
  rating: number | null
  text: string
  /** ISO date (YYYY-MM-DD) the review was posted — rendered as an exact
   * date ("15 February 2026"), not a relative "X days ago" string. */
  reviewDate?: string
  /** Google doesn't return reviewer photos, so real reviews never carry a
   * stock photo of a stranger — this just picks which illustrated avatar
   * silhouette the card renders. Live/synced reviews without a gender hint
   * fall back to a neutral silhouette. */
  gender?: 'male' | 'female'
}

function formatExactDate(reviewDate: string): string {
  return new Date(reviewDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Minimal brand-colored bust silhouette — never a photo of a real stranger
 * standing in for a real, named reviewer. Hairstyle silhouette differs by
 * gender hint; unspecified renders a neutral close-crop silhouette. */
function AvatarIllustration({ gender }: { gender?: 'male' | 'female' }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#E7CAA0" />
      {gender === 'female' && (
        <path
          d="M32 13c-8.3 0-14 6.4-14 14.3 0 3.4.6 6.7 1.7 9.7 1.1-1.4 1.8-4.6 1.9-7.6 2.3 3 5.9 4.9 10.4 4.9s8.1-1.9 10.4-4.9c.1 3 .8 6.2 1.9 7.6 1.1-3 1.7-6.3 1.7-9.7C46 19.4 40.3 13 32 13z"
          fill="#9E7641"
        />
      )}
      {gender === 'male' && (
        <path
          d="M32 15c-7.5 0-12.8 5.6-12.8 12.9 0 1.1.1 2.6.4 3.9 2.2-3 5-4.9 8.4-5.7 2.3 1.8 5.2 2.6 8 1.9 2.8 1.7 5.5 1.2 6.9.2.3 1.3.4 2.4.4 3.7C46 20.6 39.5 15 32 15z"
          fill="#9E7641"
        />
      )}
      {!gender && (
        <path
          d="M32 15.5c-6.9 0-11.8 5.2-11.8 11.9 0 1.4.2 2.9.6 4.2 2.1-3.4 5.4-5.6 11.2-5.6s9.1 2.2 11.2 5.6c.4-1.3.6-2.8.6-4.2 0-6.7-4.9-11.9-11.8-11.9z"
          fill="#9E7641"
        />
      )}
      <circle cx="32" cy="30" r="10" fill="#FDFBF7" />
      <path d="M15 55c1.2-9.6 8-15.5 17-15.5S48.8 45.4 50 55c-5 3.8-11.1 6-18 6s-13-2.2-17-6z" fill="#9E7641" />
    </svg>
  )
}

export function Stars({ count, size = 14 }: { count: number; size?: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < count ? '#9E7641' : 'none'} stroke="#9E7641" aria-hidden="true">
          <path strokeWidth="1.5" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

/**
 * Single review card — quote, stars, and the author/date identity row all
 * live inside one card (no overlap tricks that could get clipped by the
 * carousel track's scroll container), separated by a hairline divider.
 */
export function TestimonialCard({ item, className }: { item: TestimonialItem; className?: string }) {
  const exactDate = item.reviewDate ? formatExactDate(item.reviewDate) : null

  return (
    <div className={cn('flex-none snap-start', className)}>
      <div className="flex h-full flex-col rounded-2xl bg-white p-7 text-left shadow-elato-md transition-shadow duration-300 ease-out hover:shadow-elato-lg">
        <p className="text-body line-clamp-5 text-neutral-warm-500">{item.text}</p>
        {item.rating != null && (
          <div className="mt-4">
            <Stars count={item.rating} />
          </div>
        )}

        <div className="mt-5 flex items-center gap-3 border-t border-[#9E7641]/10 pt-5">
          <span className="h-11 w-11 shrink-0 overflow-hidden rounded-full shadow-elato-sm">
            <AvatarIllustration gender={item.gender} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-secondary-900">{item.author}</p>
            {exactDate && <p className="text-xs text-neutral-warm-500">{exactDate}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
