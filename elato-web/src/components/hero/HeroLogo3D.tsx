import { Component, Suspense, lazy, useState, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import { LogoImage } from '../brand/LogoImage'

const LogoScene = lazy(() => import('./LogoScene'))

// Must match LogoScene's own LOGO_ASPECT — kept here too so the loading
// placeholder below reserves the exact same box (no layout shift) without
// importing the whole 3D module just for one constant.
const LOGO_ASPECT = 1180 / 342

function isWebglSupported(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

type BoundaryProps = { children: ReactNode; fallback: ReactNode }

class LogoSceneErrorBoundary extends Component<BoundaryProps, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('ELATŌ — hero logo 3D scene failed, falling back to static wordmark:', error)
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

/**
 * Cinematic presentation of the ELATŌ wordmark. The actual Three.js/React
 * Three Fiber implementation (LogoScene.tsx) is reached only through this
 * lazy import, so it never lands in the main bundle or on other pages.
 *
 * `webglOk` is computed with a lazy `useState` initializer — synchronously,
 * during the very first render — rather than `useState(false)` + `useEffect`.
 * The old version always rendered the *finished* static logo on the first
 * paint (since the effect hadn't run yet), then swapped to the animated
 * scene once the effect resolved — a visible "logo appears, then restarts
 * its own entrance" flash. Computing it up front means the very first frame
 * already commits to the right path.
 *
 * The Suspense fallback (shown only while the lazy chunk/texture are still
 * loading) is an empty, same-sized placeholder — not the static logo — so
 * there is never a frame showing a fully-formed wordmark before the
 * animation begins. The static `<LogoImage>` is reserved for the genuinely
 * final fallback states: `prefers-reduced-motion`, no WebGL, or a runtime
 * error in the scene — where no entrance animation is expected to play at
 * all, so showing it immediately is correct rather than a flash.
 */
export function HeroLogo3D({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion()
  const [webglOk] = useState(isWebglSupported)

  if (reduceMotion || !webglOk) {
    return <LogoImage className={className} />
  }

  return (
    <LogoSceneErrorBoundary fallback={<LogoImage className={className} />}>
      <Suspense fallback={<div className={className} style={{ aspectRatio: String(LOGO_ASPECT) }} aria-hidden="true" />}>
        <LogoScene className={className} />
      </Suspense>
    </LogoSceneErrorBoundary>
  )
}
