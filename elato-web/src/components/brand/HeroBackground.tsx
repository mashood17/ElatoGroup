import type { RefObject } from 'react'
import backgroundImage from '../../assets/newbg/bg.jpg'

interface HeroBackgroundProps {
  targetRef: RefObject<HTMLElement | null>
}

/**
 * Client-approved artwork, scoped to hero sections only (Home/Stay/Celebré/
 * Events) — everywhere else uses the plain surface tokens instead of one
 * continuous canvas.
 *
 * The bottom fade is a separate overlay pinned to the section's own bottom
 * edge — a layout seam blending hero into the next section, not a filter
 * over the photo.
 */
export function HeroBackground({ targetRef: _targetRef }: HeroBackgroundProps) {
  return (
    <>
      <div
        className="absolute inset-0 -z-20"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-24 lg:h-40"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--color-surface-base))' }}
        aria-hidden="true"
      />
    </>
  )
}
