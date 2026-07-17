import { useState } from 'react'
import heroLogoAnimation from '../../assets/logos/elato-logo-animation-01.svg'

/**
 * Animated ELATŌ hero wordmark — the client-supplied self-animating SVG
 * rendered as an `<img>`. The whole entrance sequence (signal draw,
 * wireframe, material sweep, final static mark) lives inside the SVG's own
 * CSS animations, which run fine in an <img> context, so the previous
 * WebGL/Three.js pipeline is no longer needed and the vector stays perfectly
 * crisp at any rendered size.
 *
 * Sizing contract: callers set only a responsive width; `h-auto` plus the
 * intrinsic width/height attributes (mirroring the 545×185 viewBox) keep the
 * aspect ratio locked and reserve the box before the asset loads, so the
 * mark can never stretch and never causes layout shift.
 *
 * The artwork's viewBox carries deliberate transparent padding on every side
 * (~9% horizontally, ~19% vertically) as overshoot room for the animation —
 * callers compensate with negative vertical margins where exact optical
 * spacing to neighboring content matters.
 *
 * `src` carries a mount-time cache-buster: browsers can serve a repeated
 * `<img>` request for the same SVG straight from the image cache on reload,
 * which resumes/freezes the embedded CSS animation instead of restarting it
 * from frame one. Forcing a unique URL per mount (lazy `useState` so it's
 * computed once, not every render) guarantees a fresh decode — and with it
 * the full entrance sequence — on every page load.
 */
export function HeroLogo({ className = '' }: { className?: string }) {
  const [src] = useState(() => `${heroLogoAnimation}?play=${Date.now()}`)

  return (
    <img
      src={src}
      alt="ELATŌ"
      width={545}
      height={185}
      fetchPriority="high"
      decoding="async"
      draggable={false}
      className={`h-auto select-none ${className}`}
    />
  )
}
