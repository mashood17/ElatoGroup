import elatoWordmark from '../../assets/logos/elato-wordmark.png'

/**
 * Client-supplied ELATŌ wordmark artwork (background-removed for use over
 * any surface). Scoped to the navbar per request — Hero/Footer/404 keep the
 * existing code-generated `Logo` until asked to switch too, so this stays a
 * single, reusable, non-hardcoded reference rather than an inline <img> path
 * repeated at each call site.
 */
export function LogoImage({ className = 'h-7' }: { className?: string }) {
  return <img src={elatoWordmark} alt="ELATŌ" className={`w-auto ${className}`} />
}
