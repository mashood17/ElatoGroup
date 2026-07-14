import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
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
// guess and not redrawn artwork, so the macron can be isolated from the rest
// of the letters and animated as its own signature detail.
const MACRON_UV = new THREE.Vector4(0.715, 0.743, 0.148, 0.137)

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

// The body (ELATO letters) and the macron are two independent masked layers,
// each a hardcoded, constant brand color — never multiplied, tinted, lit, or
// tone-mapped. The texture supplies shape (alpha) only. Previously the
// macron's color term was added into every pixel unconditionally, not just
// its own region — bleeding taupe into the gold everywhere. Fixed below by
// mixing between the two constants using the macron's own visibility mask,
// so outside the macron's on-screen position the color is exactly,
// unconditionally BRAND_GOLD. The only animated properties left are opacity
// (uBodyOpacity), position (handled in JS), the macron's fall/landing, and
// the one-time light sweep — both of which are purely additive, transient,
// and mathematically zero once their stage ends.
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
    // Body — the ELATO letters, always excluding the macron's own resting
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

function LogoMesh() {
  const texture = useTexture(elatoWordmark)
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
      uMaskRect: { value: MACRON_UV },
    }),
    [texture],
  )

  useEffect(() => {
    // Timing is ~30% slower than the previous pass, weighted non-uniformly:
    // the reveal and the pauses around it get the most extra room to
    // breathe; the landing highlight stays close to its original length
    // since it's meant to read as a brief flash, not a lingering moment.
    const s = stage.current
    const controls = [
      // A short pause on the background alone, then the logo reveal begins:
      // fades in (opacity only, no color/brightness change) while settling
      // in from ~14px left of its final position. No bounce.
      animate(0, 1, {
        delay: 0.65,
        duration: 1.4,
        ease: EASE_LOGO,
        onUpdate: (v) => { s.bodyProgress = v },
      }),
      // Macron — falls gently once the logo reveal is almost complete.
      animate(MACRON_FALL_START, 0, {
        delay: 1.7,
        duration: 0.7,
        ease: EASE_LOGO,
        onUpdate: (v) => { s.macronFall = v },
      }),
      // One extremely soft highlight exactly as it lands, gone a fraction of
      // a second later.
      animate(0, 1, {
        delay: 2.4,
        duration: 0.3,
        ease: 'easeInOut',
        onUpdate: (v) => { s.macronHighlight = Math.sin(v * Math.PI) },
      }),
      // Stage 4 — a single soft light sweep once the macron has landed.
      animate(-0.5, 1.5, {
        delay: 2.7,
        duration: 1.2,
        ease: 'easeInOut',
        onUpdate: (v) => { s.sweep = v },
      }),
    ]

    // Idle begins only once every entrance stage has resolved.
    const idleTimer = window.setTimeout(() => {
      idleStart.current = performance.now()
    }, 3900)

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

    // The container's own aspect ratio already matches the artwork, so
    // filling the full viewport maps the texture 1:1 with zero distortion.
    mesh.scale.set(state.viewport.width, state.viewport.height, 1)

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
        }}
      >
        <LogoMesh />
      </Canvas>
    </div>
  )
}
