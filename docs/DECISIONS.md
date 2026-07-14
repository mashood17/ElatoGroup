# ELATŌ Architecture Decisions

This document records important architectural and design decisions for the ELATŌ platform.

Its purpose is to prevent future contributors (including Claude) from re-evaluating previously approved decisions.

Only update this document when a significant architectural decision has been made.

---

# Decision Log

---

## ADR-001

### Shared Hero Architecture

Status

Accepted

Reason

Every public page should feel like part of one premium hospitality brand.

Instead of building multiple hero implementations, all public pages reuse a single Hero component.

Only the content changes.

Benefits

- Consistent branding
- Smaller codebase
- Easier maintenance
- Better animation reuse
- Consistent responsiveness

Implementation

Shared Hero component with configurable props.

---

## ADR-002

### Shared Navigation

Status

Accepted

Reason

Navigation must remain visually identical across every public page.

No page should have its own navigation implementation.

Benefits

- Consistent UX
- Single source of truth
- Easier maintenance

---

## ADR-003

### Animation Library

Status

Accepted

Decision

Framer Motion is the only animation library used.

Reasons

- React-first
- Declarative
- Excellent performance
- Shared motion system
- Strong accessibility support

Rules

Do not introduce GSAP unless there is a documented technical requirement that Framer Motion cannot satisfy.

---

## ADR-004

### Motion Philosophy

Status

Accepted

Motion should communicate luxury rather than speed.

Animations must feel:

- Slow
- Elegant
- Cinematic
- Intentional
- Natural

Avoid

- Bounce
- Overshoot
- Elastic motion
- Flashy transitions
- Playful effects

Motion supports storytelling.

Motion is never decoration.

---

## ADR-005

### Hero Background Strategy

Status

Accepted

Decision

The client background artwork is reserved for hero sections only.

Reason

Using the artwork throughout the entire site reduced its visual impact and made the experience feel repetitive.

Keeping it exclusive to hero sections creates a stronger first impression while allowing the rest of the site to breathe.

Implementation

Hero background

```
src/assets/backgrounds/elato-background.png
```

Other sections use subtle, premium backgrounds that complement the hero without competing with it.

---

## ADR-006

### Logo Usage

Status

Accepted

Decision

The ELATŌ wordmark is the primary visual element of every hero.

Reason

The brand itself is the hero.

Photography or decorative elements must never dominate the first impression.

Rules

Logo file

```
src/assets/logos/elato-wordmark.png
```

Never

- recolor
- distort
- crop
- recreate
- animate excessively

Animation should emphasize elegance, not spectacle.

---

## ADR-007

### Design Language

Status

Accepted

The design direction follows premium hospitality brands rather than restaurant websites.

Primary references

- Apple
- Aman Resorts
- Four Seasons
- Ritz-Carlton
- Edition Hotels

Avoid inspiration from

- Fast food
- Food delivery apps
- Gaming websites
- Crypto dashboards
- SaaS landing pages
- Glassmorphism-heavy designs

---

## ADR-008

### Component Reuse

Status

Accepted

Decision

Every reusable UI element must exist only once.

Examples

- Buttons
- Hero
- Cards
- Section wrappers
- Typography
- Navigation

Never duplicate components for individual pages.

Prefer props over copies.

---

## ADR-009

### Styling Strategy

Status

Accepted

Decision

Tailwind CSS is the primary styling system.

Rules

- No inline styles unless technically required.
- No hardcoded colors.
- Reuse design tokens.
- Keep utility usage readable.
- Prefer reusable class abstractions where appropriate.

---

## ADR-010

### Performance Strategy

Status

Accepted

Performance is a core product requirement.

Rules

- Lazy-load non-critical images.
- Code-split routes.
- Animate only transform and opacity.
- Avoid layout thrashing.
- Minimize bundle size.
- Prevent cumulative layout shift (CLS).

---

## ADR-011

### Repository Structure

Status

Accepted

Repository layout

```
docs/
elato-web/
elato-backend/
elato-admin/
```

Each application remains independently deployable while sharing the same documentation.

---

## ADR-012

### Documentation Hierarchy

Status

Accepted

Claude must consult documents in this order before making changes.

1. docs/PRD.md
2. docs/BRAND_GUIDELINES.md
3. docs/CLAUDE_RULES.md
4. docs/PROJECT_STATE.md
5. docs/DECISIONS.md

Priority

Business Requirements

↓

Brand Rules

↓

Engineering Rules

↓

Current Project State

↓

Architecture Decisions

---

## ADR-013

### Git Workflow

Status

Accepted

Rules

One feature

↓

One branch

↓

One commit

↓

One pull request

Never combine unrelated work in a single commit.

---

## ADR-014

### Verification Requirements

Status

Accepted

Before completing any task, verify

- TypeScript compilation
- Production build
- Responsive layouts
- Accessibility
- Console errors
- Animations
- Performance impact

Never declare a task complete without verification.

---

## ADR-015

### Future Decision Process

Any new architectural decision should be recorded here.

Each decision should include

- Identifier
- Title
- Status
- Reason
- Consequences
- Implementation Notes

This document is the long-term architectural memory of the ELATŌ project.

---

## ADR-016

### Home Hero Logo — Three.js / React Three Fiber Exception

Status

Accepted (client-directed, scoped to the Home Hero logo only)

Reason

The client directed a cinematic, PBR-lit presentation of the ELATŌ wordmark
specifically, explicitly requesting React Three Fiber / Drei / Three.js.

Consequences

- Deviates from ADR-003 ("Framer Motion is the only animation library").
  Framer Motion remains the only library used for easing/tweening (including
  driving the 3D scene's own shader uniforms via its non-DOM `animate()`
  API) — Three.js/R3F/Drei are additive, used only for WebGL rendering.
- Deviates from the Brand Guidelines logo rule ("never add glow / shadows /
  outlines"). Scoped narrowly per client direction: effects are restrained
  (no bloom, no permanent glow/shadow), fire once on entrance plus an
  imperceptible idle state, and the source artwork itself is never recolored,
  cropped, or redrawn — the real `elato-wordmark.png` is rendered as-is; only
  lighting/reveal/sweep is layered on top, mathematically returning to zero
  once each stage's window ends so the resting frame matches the flat PNG.
  This exception is intentionally scoped to the Home Hero logo — no other
  logo usage (Navbar, Footer, 404, other Hero instances) is affected.

Implementation Notes

- `components/hero/HeroLogo3D.tsx` — public, reusable entry point. Gates on
  `prefers-reduced-motion` and WebGL support, wraps the scene in a local
  error boundary, and always falls back to the existing static `<LogoImage>`
  (same asset) if motion is disabled, WebGL is unavailable, or the scene
  throws at runtime.
- `components/hero/LogoScene.tsx` — the actual Three.js/R3F/Drei scene.
  Reached only via `React.lazy`, so it is code-split out of the main bundle
  and never fetched by other pages. Adds a real, non-trivial chunk (~240KB
  gzipped) to the Home page's own load — an accepted, explicitly-requested
  tradeoff against the ADR-010 performance budget, not an oversight.
- The macron's independent Stage-3 animation targets a UV rectangle measured
  directly from the real artwork's pixel data (via `sharp`, already a
  dependency), not a guessed region or a redrawn asset.