/**
 * Code-generated background of overlapping rings, recreated from the brand
 * reference as tonal-primary SVG strokes rather than a raster asset (see
 * plan: logo/hero art decision). Purely decorative — aria-hidden.
 */
const rings: { cx: number; cy: number; r: number; opacity: number }[] = [
  { cx: 90, cy: 120, r: 160, opacity: 0.16 },
  { cx: 340, cy: 60, r: 130, opacity: 0.14 },
  { cx: 620, cy: 160, r: 190, opacity: 0.18 },
  { cx: 760, cy: 40, r: 110, opacity: 0.15 },
  { cx: 180, cy: 380, r: 220, opacity: 0.12 },
  { cx: 500, cy: 420, r: 170, opacity: 0.16 },
  { cx: 40, cy: 620, r: 140, opacity: 0.14 },
  { cx: 700, cy: 500, r: 150, opacity: 0.17 },
  { cx: 330, cy: 680, r: 200, opacity: 0.13 },
  { cx: 650, cy: 720, r: 120, opacity: 0.15 },
]

export function RingPattern({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {rings.map((ring, i) => (
        <circle
          key={i}
          cx={ring.cx}
          cy={ring.cy}
          r={ring.r}
          fill="none"
          stroke="var(--color-secondary-500)"
          strokeWidth={2}
          opacity={ring.opacity}
        />
      ))}
    </svg>
  )
}
