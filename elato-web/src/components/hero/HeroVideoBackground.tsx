import { useEffect, useRef, useState } from 'react'
import { useHeroBackgrounds } from '../../lib/useHeroBackgrounds'

const BREAKPOINT_QUERY = '(min-width: 768px)'

interface HeroVideoBackgroundProps {
  /** Pauses playback once the hero scrolls out of view — same inView signal the Ken Burns/light-drift CSS layers already gate on. */
  inView: boolean
}

/**
 * Full-bleed video background layer, shared by every hero (Home/Stay/
 * Celebré/Events). The video is entirely admin-managed — fetched from
 * `GET /api/v1/hero-backgrounds` (Supabase Storage under the hood), never
 * from a bundled `public/` asset — so swapping footage is an Admin Panel
 * upload, not a deploy.
 *
 * Only the video matching the current breakpoint is ever mounted (one
 * `<video>`/`<source>` pair, swapped by `key` on breakpoint change), so
 * desktop footage is never downloaded on mobile and vice versa. Before the
 * fetch resolves — or if a slot has nothing uploaded yet — this renders just
 * the base colour + overlay, never a broken asset or a layout shift (the
 * layer is always absolutely positioned inside the hero's fixed-height
 * section regardless of whether a video is present).
 */
export function HeroVideoBackground({ inView }: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(BREAKPOINT_QUERY).matches,
  )
  const { desktop, mobile } = useHeroBackgrounds()
  const active = isDesktop ? desktop : mobile

  useEffect(() => {
    const mql = window.matchMedia(BREAKPOINT_QUERY)
    const update = () => setIsDesktop(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (inView) {
      video.play().catch(() => {
        // Autoplay can be rejected before the element is fully ready (e.g. a
        // rapid mount/unmount during route transitions) — harmless, the
        // poster stays visible and playback resumes on the next inView tick.
      })
    } else {
      video.pause()
    }
  }, [inView, active?.video_url])

  return (
    <>
      {/* Base colour underneath everything — matches the overlay's darkest
          tone, so there's nothing to flash while the hero-backgrounds
          request is in flight or if a slot has no video uploaded yet. */}
      <div className="absolute inset-0 -z-20 bg-[#0f0a06]" aria-hidden="true" />
      {active && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          key={active.video_url}
          ref={videoRef}
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={active.poster_url ?? undefined}
          aria-hidden="true"
          disablePictureInPicture
        >
          <source src={active.video_url} type={active.video_mime} />
        </video>
      )}
      {/* Readability scrim — the hero no longer carries a logo/headline to
          protect, just the bottom-center CTA, so the footage stays fully
          rich everywhere except a light bottom-anchored gradient that keeps
          the CTA legible. */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(180deg, rgba(12,8,5,0) 0%, rgba(12,8,5,0) 60%, rgba(12,8,5,0.32) 100%)',
        }}
      />
    </>
  )
}
