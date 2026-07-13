/**
 * Code-generated ELATŌ wordmark — no raster asset. Recreated from the brand
 * reference using tokens so it stays recolorable and never depends on a
 * missing image file (see plan: logo/hero art decision).
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-baseline gap-[0.06em] font-sans font-extrabold uppercase tracking-[0.14em] text-secondary-500 select-none ${className}`}
      role="img"
      aria-label="ELATŌ"
    >
      <span>ELAT</span>
      <span className="relative inline-block">
        O
        <span
          className="absolute left-1/2 -top-[0.42em] h-[0.09em] w-[0.5em] -translate-x-1/2 bg-neutral-warm-500"
          aria-hidden="true"
        />
      </span>
    </div>
  )
}
