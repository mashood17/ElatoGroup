export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-primary-100 ${className}`}
      aria-hidden="true"
    />
  )
}
