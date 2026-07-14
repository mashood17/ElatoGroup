import { Component, Suspense, lazy, useEffect, useState, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import { LogoImage } from '../brand/LogoImage'

const LogoScene = lazy(() => import('./LogoScene'))

// Project's own "Desktop" breakpoint (PRD grid system: Desktop = lg/1024px).
// Phones and tablets are touch/mobile-GPU devices where the R3F canvas was
// found to render as a broken white box — rather than chase the exact
// mobile WebGL failure mode, the 3D scene is only ever attempted at desktop
// viewport widths; everything below always gets the plain static wordmark.
const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)'

function useIsDesktopViewport(): boolean {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_MEDIA_QUERY)
    const update = () => setIsDesktop(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  return isDesktop
}

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
 * Falls back to the plain static `<LogoImage>` — same asset, same sizing via
 * the passed-through `className`, unaltered — below the desktop breakpoint,
 * for `prefers-reduced-motion`, for missing WebGL, or for any runtime error
 * in the scene. The wordmark itself is never at risk of not rendering.
 */
export function HeroLogo3D({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion()
  const isDesktop = useIsDesktopViewport()
  const [webglOk, setWebglOk] = useState(false)

  useEffect(() => {
    setWebglOk(isWebglSupported())
  }, [])

  if (reduceMotion || !isDesktop || !webglOk) {
    return <LogoImage className={className} />
  }

  return (
    <LogoSceneErrorBoundary fallback={<LogoImage className={className} />}>
      <Suspense fallback={<LogoImage className={className} />}>
        <LogoScene className={className} />
      </Suspense>
    </LogoSceneErrorBoundary>
  )
}
