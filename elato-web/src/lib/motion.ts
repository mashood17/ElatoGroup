import type { Variants } from 'framer-motion'

/**
 * Shared motion variants (PRD Ch. 25-26). Centralized so timing/easing can be
 * tuned globally and so prefers-reduced-motion degrades every animation to an
 * opacity-only crossfade in one place rather than per component.
 */

const reduceMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const rise = reduceMotion ? 0 : 16

export const heroLoadIn: Variants = {
  hidden: { opacity: 0, y: rise },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: reduceMotion ? 0 : 0.1 },
  },
}

export const cardHover: Variants = {
  rest: { y: 0, boxShadow: '0 1px 2px rgba(43,33,22,0.06)' },
  hover: {
    y: reduceMotion ? 0 : -4,
    boxShadow: '0 4px 12px rgba(43,33,22,0.10)',
    transition: { duration: 0.25, ease: 'easeOut' },
  },
}

export const modalOpen: Variants = {
  hidden: { opacity: 0, scale: reduceMotion ? 1 : 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: reduceMotion ? 1 : 0.98,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
}

export const PARALLAX_MAX_PX = 40

export const viewportOnce = { once: true, amount: 0.2 }
