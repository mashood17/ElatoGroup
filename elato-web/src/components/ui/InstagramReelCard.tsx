import { ArrowRight, Camera, Play } from 'lucide-react'
import { cn } from '../../lib/cn'
import type { InstagramReel } from '../../content/instagramContent'

/**
 * Premium reel card for Home → Instagram. No iframe embed — thumbnail
 * (or a brand-gradient placeholder when no image is set yet) + a play
 * glyph + an external link out to Instagram, so the page stays fast.
 */
interface InstagramReelCardProps {
  reel: InstagramReel
  className?: string
}

export function InstagramReelCard({ reel, className }: InstagramReelCardProps) {
  return (
    <a
      href={reel.href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'group relative flex h-[26rem] w-full flex-none flex-col overflow-hidden rounded-3xl font-sans shadow-elato-md transition-shadow duration-500 ease-out hover:shadow-elato-lg',
        className,
      )}
    >
      <div className="absolute inset-0" aria-hidden="true">
        {reel.image ? (
          <img
            src={reel.image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#9E7641] via-[#B5905E] to-[#E7CAA0] transition-transform duration-700 ease-out group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#3A2E1E]/85 via-[#3A2E1E]/15 to-[#3A2E1E]/30" />
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#E7CAA0]/60 bg-[#3A2E1E]/25 backdrop-blur-sm transition-transform duration-300 ease-out group-hover:scale-110">
          <Play className="h-6 w-6 fill-[#E7CAA0] text-[#E7CAA0]" />
        </span>
      </div>

      <div className="relative flex flex-col p-6 pt-0">
        <div className="mb-2 flex items-center gap-1.5 text-caption text-[#E7CAA0]/80">
          <Camera className="h-3.5 w-3.5" />
          {reel.isLive ? 'On Instagram' : 'Coming Soon'}
        </div>

        <h3 className="text-lg font-semibold leading-snug text-[#E7CAA0]">{reel.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-body text-[#E7CAA0]/80">{reel.description}</p>

        <span className="mt-4 inline-flex w-fit items-center gap-2 text-caption text-[#E7CAA0]">
          <span className="border-b border-[#E7CAA0]/50 pb-0.5 transition-colors duration-300 ease-out group-hover:border-[#E7CAA0]">
            View on Instagram
          </span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
        </span>
      </div>
    </a>
  )
}
