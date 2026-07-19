import { useState } from 'react'

/**
 * Stay / Celebré / Events counterpart to the Home Hero's `HeroLogo` — same
 * self-animating-SVG-as-`<img>` architecture (cache-busted `src` so the
 * entrance sequence replays on every page load, intrinsic width/height to
 * reserve the box and lock the aspect ratio), parameterized by
 * `src`/`alt`/`width`/`height` instead of being hardcoded to the Home
 * wordmark, since each page's artwork has its own native SVG dimensions.
 */
export function PremiumHeroLogo({
  src,
  alt,
  width,
  height,
  className = '',
}: {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}) {
  const [animatedSrc] = useState(() => `${src}?play=${Date.now()}`)

  return (
    <img
      src={animatedSrc}
      alt={alt}
      width={width}
      height={height}
      fetchPriority="high"
      decoding="async"
      draggable={false}
      className={`h-auto select-none ${className}`}
    />
  )
}
