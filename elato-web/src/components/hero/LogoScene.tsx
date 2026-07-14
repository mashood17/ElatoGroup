import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { animate } from 'framer-motion'
import * as THREE from 'three'
import elatoWordmark from '../../assets/logos/elato-wordmark.png'

const EASE_LOGO = [0.19, 1, 0.22, 1] as const

// Real pixel dimensions of the approved wordmark artwork — used only to keep
// the plane's aspect ratio undistorted, never to redraw the mark itself.
const LOGO_ASPECT = 1180 / 342

// Macron bounding box, measured directly from src/assets/logos/elato-wordmark.png
// via its actual pixel data (bottom-up UV, matching WebGL convention) — not a
// guess and not redrawn artwork, so Stage 3 can light the real macron alone.
const MACRON_UV = new THREE.Vector4(0.715, 0.743, 0.148, 0.137)

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// All effects are additive on top of the untouched texture color, and every
// one of them mathematically returns to exactly zero once its stage window
// ends — so the resting frame (uReveal=1, uRim=0, uMacron=0, uSweep>1,
// uBreathe~1) renders pixel-identical to the flat source artwork.
const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uReveal;
  uniform float uRim;
  uniform float uMacron;
  uniform float uSweep;
  uniform float uBreathe;
  uniform vec4 uMaskRect;
  varying vec2 vUv;

  float macronMask(vec2 uv, vec4 rect) {
    vec2 center = rect.xy + rect.zw * 0.5;
    vec2 halfSize = rect.zw * 0.5;
    vec2 d = abs(uv - center) - halfSize;
    float dist = length(max(d, 0.0));
    return 1.0 - smoothstep(0.0, 0.05, dist);
  }

  void main() {
    vec4 tex = texture2D(uMap, vUv);

    // Stage 1+2 — a soft vertical wipe, like light gradually finding premium
    // material, rather than a flat opacity fade.
    float bandHalf = 0.2;
    float edgeHeight = mix(-bandHalf, 1.0 + bandHalf, uReveal);
    float revealAlpha = 1.0 - smoothstep(edgeHeight - bandHalf, edgeHeight + bandHalf, vUv.y);

    vec3 color = tex.rgb;

    // Subtle warm rim catching the light as the mark settles in (Stage 2).
    float rimBand = clamp(1.0 - abs(vUv.y - 0.5) * 1.3, 0.0, 1.0);
    color += vec3(1.0, 0.9, 0.72) * uRim * rimBand * 0.10;

    // Stage 3 — the macron's own signature illumination, masked to itself.
    color += vec3(1.0, 0.82, 0.5) * uMacron * macronMask(vUv, uMaskRect) * 0.55;

    // Stage 4 — one soft diagonal light sweep, warm and brief.
    float sweepDist = (vUv.x * 0.8 + vUv.y * 0.2) - uSweep;
    float sweepBand = 1.0 - smoothstep(0.0, 0.22, abs(sweepDist));
    color += vec3(1.0, 0.95, 0.85) * sweepBand * 0.10;

    // Stage 5 — sub-1% idle brightness breathing, applied last.
    color *= uBreathe;

    gl_FragColor = vec4(color, tex.a * revealAlpha);
  }
`

function LogoMesh() {
  const texture = useTexture(elatoWordmark)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  const meshRef = useRef<THREE.Mesh>(null!)
  const { viewport } = useThree()
  const stage = useRef({ reveal: 0, rim: 0, macron: 0, sweep: -0.5 })
  const idleStart = useRef<number | null>(null)

  useMemo(() => {
    // No color-space conversion here — the shader must sample and output the
    // exact source bytes at rest, matching the plain `<img>` rendering
    // (#9E7641). `outputColorSpace: LinearSRGBColorSpace` on the Canvas below
    // pairs with this so nothing double-encodes on the way out.
    texture.colorSpace = THREE.NoColorSpace
    texture.anisotropy = 4
  }, [texture])

  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uReveal: { value: 0 },
      uRim: { value: 0 },
      uMacron: { value: 0 },
      uSweep: { value: -0.5 },
      uBreathe: { value: 1 },
      uMaskRect: { value: MACRON_UV },
    }),
    [texture],
  )

  useEffect(() => {
    const s = stage.current
    const controls = [
      // Stage 1+2 — calm reveal + premium settle.
      animate(0, 1, { duration: 1.6, ease: EASE_LOGO, onUpdate: (v) => { s.reveal = v } }),
      animate(0, 1, { duration: 1.6, ease: EASE_LOGO, onUpdate: (v) => { s.rim = Math.sin(v * Math.PI) } }),
      // Stage 3 — signature macron glow, its own short window.
      animate(0, 1, {
        delay: 1.1,
        duration: 0.9,
        ease: 'easeInOut',
        onUpdate: (v) => { s.macron = Math.sin(v * Math.PI) },
      }),
      // Stage 4 — a single soft light sweep once the mark has settled.
      animate(-0.5, 1.5, {
        delay: 1.85,
        duration: 1.1,
        ease: 'easeInOut',
        onUpdate: (v) => { s.sweep = v },
      }),
    ]

    // Stage 5 — idle begins only once every entrance stage has resolved.
    const idleTimer = window.setTimeout(() => {
      idleStart.current = performance.now()
    }, 2950)

    return () => {
      controls.forEach((c) => c.stop())
      window.clearTimeout(idleTimer)
    }
  }, [])

  useFrame((state) => {
    const u = materialRef.current?.uniforms
    if (!u) return
    const s = stage.current
    u.uReveal.value = s.reveal
    u.uRim.value = s.rim
    u.uMacron.value = s.macron
    u.uSweep.value = s.sweep

    const mesh = meshRef.current
    if (!mesh) return

    // The container's own aspect ratio already matches the artwork, so
    // filling the full viewport maps the texture 1:1 with zero distortion.
    mesh.scale.set(viewport.width, viewport.height, 1)

    if (idleStart.current !== null) {
      const t = (performance.now() - idleStart.current) / 1000
      u.uBreathe.value = 1 + Math.sin(t * 0.5) * 0.012

      // Sub-degree, heavily damped pointer parallax — alive, never distracting.
      const targetRotY = state.pointer.x * 0.015
      const targetRotX = -state.pointer.y * 0.01
      mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.02
      mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.02
    }
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        toneMapped={false}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
      />
    </mesh>
  )
}

/**
 * The actual Three.js/R3F scene — kept out of the main bundle by always being
 * reached through `HeroLogo3D`'s `React.lazy` import. Renders the real,
 * unaltered wordmark artwork as a textured plane with a restrained, one-time
 * cinematic reveal (see LogoMesh/FRAGMENT_SHADER); nothing here changes the
 * logo's proportions, colors, or content.
 */
export default function LogoScene({ className }: { className?: string }) {
  return (
    <div className={className} style={{ aspectRatio: String(LOGO_ASPECT) }}>
      <Canvas
        dpr={[1, 2]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'low-power',
          toneMapping: THREE.NoToneMapping,
          outputColorSpace: THREE.LinearSRGBColorSpace,
        }}
      >
        <LogoMesh />
      </Canvas>
    </div>
  )
}
