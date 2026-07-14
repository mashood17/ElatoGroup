# ELATŌ Engineering Rules

**Project:** ELATŌ Premium Hospitality Platform

**Version:** 1.0

**Status:** Mandatory

---

# Purpose

This document defines the engineering standards for the ELATŌ project.

Every coding task MUST follow these rules.

Read this document before writing any code.

These rules override personal coding preferences.

---

# Development Workflow

Before writing code:

1. Read:
   - docs/PRD.md
   - docs/BRAND_GUIDELINES.md
   - docs/PROJECT_STATE.md

2. Inspect the existing implementation.

3. Understand the architecture.

4. Reuse existing components whenever possible.

5. Only then begin implementation.

Never start coding immediately.

Always think first.

---

# Core Principles

Always:

- Build production-quality code.
- Write maintainable code.
- Keep code readable.
- Prefer composition.
- Prefer reuse.
- Keep implementations simple.

Never:

- Rewrite working code.
- Duplicate logic.
- Duplicate components.
- Create unnecessary abstractions.
- Introduce technical debt.

---

# Tech Stack

Frontend

- React 19
- Vite
- TypeScript
- Tailwind CSS v4
- Framer Motion

Backend

- FastAPI
- Python
- PostgreSQL
- Supabase

Deployment

- Vercel
- Render

---

# Folder Structure

```
src/

assets/
backgrounds/
icons/
logos/
images/

components/
brand/
layout/
sections/
shared/
ui/

hooks/

lib/

repositories/

content/

pages/

types/

styles/

utils/
```

Maintain this structure.

Do not invent new folders unless absolutely necessary.

---

# Component Architecture

Prefer:

```
Hero
↓

Sections

↓

Shared Components

↓

UI Components
```

Keep business logic outside UI components.

Components should have one responsibility.

Extract repeated logic.

---

# Component Rules

Every component should:

- Be reusable.
- Be typed.
- Be readable.
- Be composable.

Avoid:

- Large monolithic files.
- Duplicate JSX.
- Inline helper functions.
- Inline styles.

Target:

200–250 lines maximum.

Extract when necessary.

---

# TypeScript Rules

Strict mode.

Never use:

```
any
```

Prefer:

- interfaces
- utility types
- discriminated unions
- generic types

Use proper typing everywhere.

---

# Styling Rules

Use:

Tailwind CSS only.

Never:

Inline styles

unless dynamic values cannot be expressed otherwise.

Never hardcode colors.

Always use design tokens.

Spacing must remain consistent.

---

# Naming Conventions

Components

```
HeroSection.tsx
Navbar.tsx
ServiceCard.tsx
```

Hooks

```
useScrollReveal.ts

useActiveSection.ts
```

Utilities

```
formatDate.ts

calculateRating.ts
```

Constants

UPPER_CASE

Interfaces

PascalCase

Variables

camelCase

---

# Animation Rules

Use:

Framer Motion

Only.

Never use:

- GSAP
- Anime.js
- CSS libraries

unless explicitly approved.

---

# Motion Philosophy

Animations must feel:

- Premium
- Slow
- Smooth
- Intentional
- Cinematic

Never:

- Bounce excessively
- Spin
- Shake
- Flash
- Rotate continuously

Luxury is restraint.

---

# Animation Priority

1 Hero

2 Navigation

3 Page transitions

4 Sections

5 Cards

6 Buttons

Everything else is secondary.

---

# Animation Performance

Animate only:

- opacity
- transform
- translate
- scale
- rotate

Never animate:

- width
- height
- left
- top
- margin
- padding

Avoid layout thrashing.

---

# Motion Timing

Hero

800–1400ms

Sections

500–700ms

Cards

300–500ms

Hover

150–250ms

Buttons

150–200ms

---

# Reduced Motion

Always support

prefers-reduced-motion.

Animations must degrade gracefully.

---

# Hero Rules

Hero exists once.

Create one reusable Hero component.

Each page passes different props.

Never duplicate Hero implementations.

Hero contains:

- Background
- Logo
- Heading
- Supporting copy
- CTA

Nothing else.

---

# Background Rules

Hero background:

```
src/assets/backgrounds/elato-background.png
```

Never:

Replace

Compress

Tint

Blur

Stretch

Use:

cover

center

optimized loading

---

# Logo Rules

Logo:

```
src/assets/logos/elato-wordmark.png
```

Never:

Distort

Crop

Recolor

Logo is always highest visual priority.

---

# Image Rules

Always:

Maintain aspect ratio.

Lazy load below fold.

Use responsive sizing.

Optimize loading.

Avoid layout shifts.

Never duplicate assets.

---

# Performance Rules

Target Lighthouse:

Performance ≥95

Accessibility ≥95

Best Practices ≥95

SEO ≥95

Always:

Lazy load

Code split

Optimize imports

Memoize expensive work

Avoid unnecessary rerenders

---

# Accessibility Rules

Semantic HTML.

Proper heading hierarchy.

Keyboard navigation.

Screen reader support.

Color contrast.

Reduced motion.

Accessible forms.

---

# Responsive Rules

Desktop

Laptop

Tablet

Mobile

Landscape

Portrait

Every feature must work on every breakpoint.

Never:

Horizontal scrolling.

Clipped components.

Broken layouts.

---

# Forms

Validate inputs.

Handle loading states.

Handle success states.

Handle error states.

Prevent duplicate submissions.

---

# State Management

Prefer:

React state

React context

Local component state

Only introduce global state if necessary.

---

# Repository Pattern

Business logic belongs in repositories.

UI components never directly manage API logic.

Keep concerns separated.

---

# Error Handling

Always:

Handle API failures.

Handle empty states.

Handle loading.

Handle retries when appropriate.

Never fail silently.

---

# Git Rules

One feature.

One commit.

One responsibility.

Never mix unrelated work.

Commit message format:

```
feat(hero): redesign premium hero animation

fix(navbar): improve mobile responsiveness

refactor(cards): extract shared card component
```

---

# Before Modifying Files

Read the entire file.

Understand dependencies.

Search for similar implementations.

Reuse existing code.

Avoid duplication.

---

# Before Creating New Components

Ask:

Can an existing component be reused?

Can props solve this?

Can composition solve this?

Only create new components when necessary.

---

# Code Quality Checklist

Before finishing:

No console.log

No commented code

No unused imports

No dead code

No duplicated logic

No duplicated animations

No duplicated styles

No TypeScript errors

No ESLint errors

---

# Testing Checklist

Verify:

Desktop

Laptop

Tablet

Mobile

Navigation

Animations

Accessibility

Performance

Forms

Images

Console

Build

---

# Build Verification

Run:

```
npm run build
```

Ensure:

No warnings.

No errors.

No TypeScript failures.

---

# Completion Checklist

Before marking a task complete:

✓ Architecture preserved

✓ Existing components reused

✓ Responsive

✓ Accessible

✓ Performance maintained

✓ Build successful

✓ No console errors

✓ Animations polished

✓ Brand guidelines followed

✓ PRD requirements satisfied

---

# Required Completion Summary

Every completed task must include:

## Files Changed

- List every modified file.

## Reason

Explain why each file changed.

## Verification

Confirm:

- Build passed
- Responsive
- Accessibility
- Performance
- Animations
- No console errors

## Recommendations

Suggest improvements only if they are outside the current task.

Never modify unrelated parts of the project without approval.

---

# Golden Rule

The objective is not to write the most code.

The objective is to produce the highest quality implementation with the smallest, cleanest, most maintainable set of changes while preserving the ELATŌ premium experience.