import { forwardRef } from 'react'
import elatoWordmark from '../../assets/logos/elato-wordmark.webp'

/**
 * Client-supplied ELATŌ wordmark artwork (background-removed for use over
 * any surface). Scoped to the navbar per request — Hero/Footer/404 keep the
 * existing code-generated `Logo` until asked to switch too, so this stays a
 * single, reusable, non-hardcoded reference rather than an inline <img> path
 * repeated at each call site.
 *
 * Forwards its ref so `Navbar` can register this exact element with
 * `splashState.ts` — the splash measures its resting position/size to fly
 * its own wordmark there on exit (see `Splash.tsx`).
 */
export const LogoImage = forwardRef<HTMLImageElement, { src?: string; className?: string }>(
  function LogoImage({ src = elatoWordmark, className = 'h-7' }, ref) {
    return <img ref={ref} src={src} alt="ELATŌ" className={`w-auto ${className}`} />
  },
)
