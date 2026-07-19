import { cn } from '../../lib/cn'

type SiteImageProps = {
  src?: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
}

/**
 * Admin-managed section photo with no bundled static fallback — while
 * `site_content` hasn't loaded (or the admin hasn't uploaded one for this
 * slot yet), renders a neutral placeholder at the exact same box (via the
 * same `className`) instead of a broken `<img>`, so layout never shifts once
 * the real photo arrives.
 */
export function SiteImage({ src, alt, className, loading = 'lazy' }: SiteImageProps) {
  if (!src) {
    return (
      <div
        className={cn('flex items-center justify-center bg-gradient-to-br from-sand-light via-sand to-tan', className)}
        aria-hidden="true"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-ink-soft/70">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="9" cy="10.5" r="1.6" stroke="currentColor" strokeWidth="1.4" />
          <path d="M3 16.5L8.5 12l3.5 3 3-2.5L21 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }
  return <img src={src} alt={alt} className={className} loading={loading} />
}
