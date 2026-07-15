import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { animate } from 'framer-motion'
import * as THREE from 'three'

const EASE_LOGO = [0.19, 1, 0.22, 1] as const

// How far above its resting spot the macron starts (UV units) — large enough
// that its masked rect sits entirely above the visible frame (max vUv.y is
// 1.0), so before its own stage begins it is not merely transparent, it is
// genuinely not drawn at all.
const MACRON_FALL_START = 0.35

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// The body (letters) and the macron are two independent masked layers, each
// a hardcoded, constant brand color — never multiplied, tinted, lit, or
// tone-mapped. The texture supplies shape (alpha) only, so the resting logo
// is always exactly BRAND_GOLD / BRAND_TAUPE regardless of which page's
// artwork file is loaded. Every animated uniform mathematically returns to
// its neutral value once its stage ends, so the resting frame is always the
// flat brand colors, untinted.
const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uBodyOpacity;
  uniform float uMacronFall;
  uniform float uMacronHighlight;
  uniform float uSweep;
  uniform vec4 uMaskRect;
  varying vec2 vUv;

  const vec3 BRAND_GOLD = vec3(0.61960784, 0.46274510, 0.25490196); // #9E7641, exact
  const vec3 BRAND_TAUPE = vec3(0.63921569, 0.56862745, 0.48627451); // #A3917C, exact

  float rectMask(vec2 uv, vec4 rect) {
    vec2 center = rect.xy + rect.zw * 0.5;
    vec2 halfSize = rect.zw * 0.5;
    vec2 d = abs(uv - center) - halfSize;
    float dist = length(max(d, 0.0));
    return 1.0 - smoothstep(0.0, 0.05, dist);
  }

  void main() {
    // Body — the wordmark letters, always excluding the macron's own resting
    // slot (the macron is exclusively drawn by the layer below). Alpha only
    // carries the reveal — color is the constant brand gold, unconditionally.
    float bodyExclude = 1.0 - rectMask(vUv, uMaskRect);
    vec4 bodyTex = texture2D(uMap, vUv);
    float bodyAlpha = bodyTex.a * bodyExclude * uBodyOpacity;

    // Macron — falls from above into its resting rect. The texture is only
    // sampled for alpha (shape); displaced on screen while still falling.
    vec4 fallingRect = uMaskRect + vec4(0.0, uMacronFall, 0.0, 0.0);
    float macronVisible = rectMask(vUv, fallingRect);
    vec2 macronSampleUv = vUv - vec2(0.0, uMacronFall);
    vec4 macronTex = texture2D(uMap, macronSampleUv);
    vec3 macronColor = BRAND_TAUPE + vec3(1.0, 0.85, 0.55) * uMacronHighlight * 0.5;
    float macronAlpha = macronTex.a * macronVisible;

    // Blended only by the macron's own mask — everywhere else this is
    // exactly BRAND_GOLD, with zero contribution from macronColor.
    vec3 color = mix(BRAND_GOLD, macronColor, macronVisible);
    float alpha = clamp(bodyAlpha + macronAlpha, 0.0, 1.0);

    // One soft diagonal light sweep, warm and brief, over whatever is
    // already visible — purely additive, and zero once uSweep leaves [0,1].
    float sweepDist = (vUv.x * 0.8 + vUv.y * 0.2) - uSweep;
    float sweepBand = 1.0 - smoothstep(0.0, 0.22, abs(sweepDist));
    color += vec3(1.0, 0.95, 0.85) * sweepBand * 0.10 * alpha;

    gl_FragColor = vec4(color, alpha);
  }
`

type LogoMeshProps = { src: string; macronRect: THREE.Vector4; aspect: number }

function LogoMesh({ src, macronRect, aspect }: LogoMeshProps) {
  const texture = useTexture(src)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  const meshRef = useRef<THREE.Mesh>(null!)
  const stage = useRef({ bodyProgress: 0, macronFall: MACRON_FALL_START, macronHighlight: 0, sweep: -0.5 })
  const idleStart = useRef<number | null>(null)

  useMemo(() => {
    // Texture is only sampled for its alpha channel (shape) — color is a
    // hardcoded constant in FRAGMENT_SHADER, so the texture's own
    // color-space handling is irrelevant here.
    texture.colorSpace = THREE.NoColorSpace
    texture.anisotropy = 4
  }, [texture])

  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uBodyOpacity: { value: 0 },
      uMacronFall: { value: MACRON_FALL_START },
      uMacronHighlight: { value: 0 },
      uSweep: { value: -0.5 },
      uMaskRect: { value: macronRect },
    }),
    [texture, macronRect],
  )

  useEffect(() => {
    // Identical timeline to the Home Hero logo: reveal begins almost
    // immediately (0.10s), and each later stage's duration is set so it ends
    // exactly when the next one begins (macron fall -> highlight -> sweep ->
    // idle), keeping the same "next stage starts right as the previous one
    // resolves" chaining.
    const s = stage.current
    const controls = [
      // Logo reveal begins almost immediately: fades in (opacity only, no
      // color/brightness change) while settling in from ~14px left of its
      // final position. No bounce.
      animate(0, 1, {
        delay: 0.1,
        duration: 1.25,
        ease: EASE_LOGO,
        onUpdate: (v) => { s.bodyProgress = v },
      }),
      // Macron — falls gently once the logo reveal is almost complete.
      animate(MACRON_FALL_START, 0, {
        delay: 1.0,
        duration: 0.5,
        ease: EASE_LOGO,
        onUpdate: (v) => { s.macronFall = v },
      }),
      // One extremely soft highlight exactly as it lands, gone a fraction of
      // a second later.
      animate(0, 1, {
        delay: 1.5,
        duration: 0.4,
        ease: 'easeInOut',
        onUpdate: (v) => { s.macronHighlight = Math.sin(v * Math.PI) },
      }),
      // A single soft light sweep once the macron has landed.
      animate(-0.5, 1.5, {
        delay: 1.9,
        duration: 0.6,
        ease: 'easeInOut',
        onUpdate: (v) => { s.sweep = v },
      }),
    ]

    // Idle begins only once every entrance stage has resolved.
    const idleTimer = window.setTimeout(() => {
      idleStart.current = performance.now()
    }, 2500)

    return () => {
      controls.forEach((c) => c.stop())
      window.clearTimeout(idleTimer)
    }
  }, [])

  useFrame((state) => {
    const u = materialRef.current?.uniforms
    const mesh = meshRef.current
    if (!u || !mesh) return

    const s = stage.current
    u.uBodyOpacity.value = s.bodyProgress
    u.uMacronFall.value = s.macronFall
    u.uMacronHighlight.value = s.macronHighlight
    u.uSweep.value = s.sweep

    // Contain-fit against the artwork's own aspect ratio rather than blindly
    // filling the canvas viewport. The Stay/Célébré/Events wordmark art has
    // zero margin around the letters (the "Ō" sits flush against the source
    // PNG's own right/top edge) — unlike the Home Hero's wordmark, which has
    // generous padding. That means this plane has no room to absorb even a
    // sub-pixel gap between the container's CSS `aspect-ratio` and its
    // measured canvas size; filling the viewport unconditionally would
    // stretch the texture to match whatever shape the box actually ended up,
    // cropping straight through the letters. Deriving the plane's size from
    // the known-correct `aspect` prop instead guarantees the full artwork is
    // always shown intact, letterboxed within the canvas if the box shape
    // doesn't match exactly, never stretched or cropped.
    const canvasAspect = state.viewport.width / state.viewport.height
    if (canvasAspect > aspect) {
      mesh.scale.set(state.viewport.height * aspect, state.viewport.height, 1)
    } else {
      mesh.scale.set(state.viewport.width, state.viewport.width / aspect, 1)
    }

    // World units per CSS pixel, for the sub-16px entrance offset and the
    // 1-2px idle breathing below.
    const pxToWorld = state.viewport.width / state.size.width
    mesh.position.x = -14 * pxToWorld * (1 - s.bodyProgress)

    if (idleStart.current !== null) {
      const t = (performance.now() - idleStart.current) / 1000
      // Extremely subtle idle breathing — 1.5px maximum, never distracting.
      mesh.position.y = Math.sin(t * 0.5) * 1.5 * pxToWorld

      // Sub-degree, heavily damped pointer parallax.
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

export type PremiumLogoSceneProps = {
  className?: string
  src: string
  aspect: number
  macronRect: [number, number, number, number]
}

/**
 * Shared Three.js/R3F scene powering the Stay / Celebré / Events hero logos —
 * a parameterized twin of the Home Hero's own `LogoScene`. The shader,
 * timeline, easing, and brand colors are identical on purpose (per the
 * "identical Three.js implementation" requirement); only the texture
 * (`src`), plane aspect ratio, and macron mask rect differ per page. Kept as
 * a fully separate file rather than modifying the Home Hero's `LogoScene` —
 * the Home Hero is locked and was not touched to build this.
 */
export default function PremiumLogoScene({ className, src, aspect, macronRect }: PremiumLogoSceneProps) {
  const maskRect = useMemo(() => new THREE.Vector4(...macronRect), [macronRect])

  return (
    <div className={className} style={{ aspectRatio: String(aspect) }}>
      <Canvas
        dpr={[1, 2]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'low-power',
          toneMapping: THREE.NoToneMapping,
        }}
      >
        <LogoMesh src={src} macronRect={maskRect} aspect={aspect} />
      </Canvas>
    </div>
  )
}
