import { useEffect, useState } from 'react'
import { getHeroBackgrounds } from './heroBackgroundRepository'
import type { HeroBackgroundDto } from './heroBackgroundRepository'

interface HeroBackgrounds {
  desktop?: HeroBackgroundDto
  mobile?: HeroBackgroundDto
}

/**
 * Resolves both hero video slots once per mount. `HeroVideoBackground` picks
 * whichever matches the current breakpoint itself, so only that one video
 * element/source ever mounts — desktop assets are never downloaded on
 * mobile, and vice versa.
 */
export function useHeroBackgrounds(): HeroBackgrounds {
  const [state, setState] = useState<HeroBackgrounds>({})

  useEffect(() => {
    let cancelled = false
    getHeroBackgrounds().then((map) => {
      if (!cancelled) setState({ desktop: map.desktop, mobile: map.mobile })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
