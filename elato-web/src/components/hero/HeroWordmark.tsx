import { useState } from 'react'

/**
 * Self-animating ELATŌ wordmark, shared by every hero (Home/Stay/Celebré/
 * Events) — the client-supplied SVG's baked-in entrance (signal draw,
 * wireframe, material sweep, final static mark) rendered as an `<img>`,
 * parameterized by `src`/`alt`/`width`/`height` since each page has its own
 * sub-brand artwork.
 *
 * Sizing contract: callers set only a responsive width via `className`;
 * `h-auto` plus the intrinsic width/height attributes keep the aspect ratio
 * locked and reserve the box before the asset loads, so the mark can never
 * stretch and never causes layout shift.
 *
 * `src` carries a mount-time cache-buster: browsers can serve a repeated
 * `<img>` request for the same SVG straight from the image cache on reload,
 * which resumes/freezes the embedded CSS animation instead of restarting it
 * from frame one. Forcing a unique URL per mount (lazy `useState` so it's
 * computed once, not every render) guarantees a fresh decode — and with it
 * the full entrance sequence — on every page load.
 */
export function HeroWordmark({
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
      className={`h-auto max-w-none select-none ${className}`}
    />
  )
}
