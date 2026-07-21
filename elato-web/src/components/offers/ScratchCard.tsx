import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'

interface ScratchCardProps {
  width: number
  height: number
  /** Fraction (0-1) of the coating that must be cleared before it auto-reveals. */
  revealThreshold?: number
  onReveal: () => void
  /** The reward content sitting under the scratchable coating. */
  children: ReactNode
  coatingLabel?: string
}

/**
 * Canvas-based scratch-off coating over arbitrary reward content. Pointer
 * drags erase a soft-edged circle (destination-out compositing) at each
 * point along the stroke; once the cleared fraction of the canvas crosses
 * `revealThreshold`, the coating fades out and `onReveal` fires once.
 *
 * No third-party scratch-card library — the mechanic is simple enough (erase
 * + periodically sample alpha) that pulling in a dependency for it isn't
 * worth the bundle weight, and this way the coating's look/feel (gradient,
 * label, brush size) stays fully in the site's own design language.
 */
export function ScratchCard({ width, height, revealThreshold = 0.4, onReveal, children, coatingLabel = 'Scratch Here' }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [revealed, setRevealed] = useState(false)
  const isDrawing = useRef(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const scratchCount = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#2b2116')
    gradient.addColorStop(0.5, '#4a3a22')
    gradient.addColorStop(1, '#2b2116')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = 'rgba(231, 202, 160, 0.35)'
    ctx.lineWidth = 1
    ctx.strokeRect(6, 6, width - 12, height - 12)

    ctx.font = '600 15px "Century Gothic", sans-serif'
    ctx.fillStyle = 'rgba(231, 202, 160, 0.7)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(coatingLabel, width / 2, height / 2 - 2)
    ctx.font = '400 11px sans-serif'
    ctx.fillStyle = 'rgba(231, 202, 160, 0.45)'
    ctx.fillText('scratch to reveal', width / 2, height / 2 + 18)
  }, [width, height, coatingLabel])

  function pointFromEvent(e: PointerEvent<HTMLCanvasElement>): { x: number; y: number } {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function scratchAt(x: number, y: number) {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 24, 0, Math.PI * 2)
    ctx.fill()
  }

  // A synchronous counter rather than requestAnimationFrame-throttled
  // sampling: rAF callbacks are paused whenever the tab/page isn't visible
  // (background tab, alt-tabbed window), which would silently stall the
  // reveal check mid-scratch. Checking every 4th scratch point instead
  // keeps the cost bounded without depending on the page ever painting.
  function checkProgress() {
    if (revealed) return
    scratchCount.current += 1
    if (scratchCount.current % 4 !== 0) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const w = canvas.width
    const h = canvas.height
    const step = 8
    const data = ctx.getImageData(0, 0, w, h).data
    let cleared = 0
    let total = 0
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        total++
        if (data[(y * w + x) * 4 + 3] < 80) cleared++
      }
    }
    if (total > 0 && cleared / total >= revealThreshold) {
      setRevealed(true)
      onReveal()
    }
  }

  function handlePointerDown(e: PointerEvent<HTMLCanvasElement>) {
    if (revealed) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // Some pointer sources (older Safari, certain stylus drivers) reject
      // capture for a pointerId that isn't "active" yet — harmless, the
      // scratch still tracks via the move/up listeners either way.
    }
    isDrawing.current = true
    const p = pointFromEvent(e)
    lastPoint.current = p
    scratchAt(p.x, p.y)
    checkProgress()
  }

  function handlePointerMove(e: PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current || revealed) return
    const p = pointFromEvent(e)
    const last = lastPoint.current
    if (last) {
      const dist = Math.hypot(p.x - last.x, p.y - last.y)
      const steps = Math.max(1, Math.ceil(dist / 8))
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        scratchAt(last.x + (p.x - last.x) * t, last.y + (p.y - last.y) * t)
      }
    } else {
      scratchAt(p.x, p.y)
    }
    lastPoint.current = p
    checkProgress()
  }

  function handlePointerUp() {
    isDrawing.current = false
    lastPoint.current = null
  }

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ width, height }}>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      <canvas
        ref={canvasRef}
        style={{ width, height, touchAction: 'none', opacity: revealed ? 0 : 1, transition: 'opacity 0.7s ease-out' }}
        className="absolute inset-0 cursor-pointer"
        aria-label="Scratch card — drag to reveal your reward"
        role="img"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  )
}
