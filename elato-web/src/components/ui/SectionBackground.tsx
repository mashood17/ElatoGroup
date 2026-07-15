import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { PARALLAX_MAX_PX } from '../../lib/motion'

const BLEED_PX = 160

/**
 * Full-bleed section backdrop shared by every homepage section below the
 * hero. The image bleeds BLEED_PX above the section's own box and fades in
 * over that span via a mask, so it physically overlaps and crossfades into
 * the tail of the section above it — a real photograph-to-photograph blend
 * instead of a hard cut, with no divider or colour wash needed. Past that
 * fade band the image is always fully visible. A scroll-linked scale (Ken
 * Burns) and parallax drift add depth; the scale also supplies the buffer
 * the parallax needs so no edge is ever exposed, and its own overflow is
 * contained locally so nothing bleeds past the section horizontally.
 */
export function SectionBackground({ image }: { image: string }) {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [-PARALLAX_MAX_PX, PARALLAX_MAX_PX],
  )
  const scale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [1.05, 1.16])

  const maskImage = `linear-gradient(to bottom, transparent 0px, black ${BLEED_PX}px, black 100%)`

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ top: -BLEED_PX, height: `calc(100% + ${BLEED_PX}px)` }}
      className="absolute inset-x-0 -z-10 overflow-hidden"
    >
      <motion.img
        src={image}
        alt=""
        loading="eager"
        decoding="async"
        style={{ y: parallaxY, scale, maskImage, WebkitMaskImage: maskImage }}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </div>
  )
}
