import { Component, Suspense, lazy, useState, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'

const PremiumLogoScene = lazy(() => import('./PremiumLogoScene'))

function isWebglSupported(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return false
    // This probe context is thrown away immediately — explicitly lose it so
    // the GPU driver reclaims it right away instead of waiting on GC, which
    // otherwise accumulates one stale context per page navigation (each
    // Stay/Célébré/Events hero mount runs this check again).
    ;(gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext()
    return true
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

export type PremiumHeroLogo3DProps = {
  className?: string
  src: string
  aspect: number
  macronRect: [number, number, number, number]
  alt: string
}

/**
 * Stay / Celebré / Events counterpart to the Home Hero's `HeroLogo3D` —
 * same gating logic (reduced motion, WebGL support, runtime-error fallback,
 * blank Suspense placeholder to avoid a "finished logo, then re-animates"
 * flash), parameterized by `src`/`aspect`/`macronRect` instead of being
 * hardcoded to the Home wordmark. The static fallback is a plain `<img>`
 * (not `LogoImage`, which is hardcoded to the Home asset) so each page falls
 * back to its own real logo file.
 */
export function PremiumHeroLogo3D({ className, src, aspect, macronRect, alt }: PremiumHeroLogo3DProps) {
  const reduceMotion = useReducedMotion()
  const [webglOk] = useState(isWebglSupported)

  const staticFallback = <img src={src} alt={alt} className={`h-auto ${className ?? ''}`} />

  if (reduceMotion || !webglOk) {
    return staticFallback
  }

  return (
    <LogoSceneErrorBoundary fallback={staticFallback}>
      <Suspense fallback={<div className={className} style={{ aspectRatio: String(aspect) }} aria-hidden="true" />}>
        <PremiumLogoScene className={className} src={src} aspect={aspect} macronRect={macronRect} />
      </Suspense>
    </LogoSceneErrorBoundary>
  )
}
