/**
 * Code-generated ELATŌ wordmark — no raster asset. Recreated in code (not
 * traced from any reference image) so it stays recolorable and never
 * depends on a missing image file. When real logo artwork is supplied, this
 * is the single place it gets swapped in.
 */
export function Logo({
  className = '',
  as = 'div',
  ariaLabel = 'ELATŌ',
}: {
  className?: string
  as?: 'div' | 'h1'
  ariaLabel?: string
}) {
  const Tag = as
  return (
    <Tag
      className={`inline-flex items-baseline gap-[0.06em] font-sans font-extrabold uppercase tracking-[0.14em] text-secondary-500 select-none ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <span>ELAT</span>
      <span className="relative inline-block">
        O
        <span
          className="absolute left-1/2 -top-[0.42em] h-[0.09em] w-[0.5em] -translate-x-1/2 bg-neutral-warm-500"
          aria-hidden="true"
        />
      </span>
    </Tag>
  )
}
