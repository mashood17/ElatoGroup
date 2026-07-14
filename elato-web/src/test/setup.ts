// Vitest + RTL global setup. Loaded once per test file via vitest.config.ts's
// `test.setupFiles`.
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// RTL doesn't auto-cleanup between tests outside of specific test runners.
afterEach(() => {
  cleanup()
})

// jsdom doesn't implement matchMedia. `src/lib/motion.ts` calls it at module
// load time (top-level `reduceMotion` check), so anything importing that
// module transitively needs this stub or the import throws in every test.
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

// framer-motion's `whileInView` (used by sectionReveal/viewportOnce) relies on
// IntersectionObserver, which jsdom also doesn't implement.
if (!('IntersectionObserver' in window)) {
  // Deliberately not typed against the real `IntersectionObserver` interface
  // (which requires a handful of unused members like `scrollMargin`) — this
  // is a minimal stand-in, not a spec-accurate polyfill.
  class MockIntersectionObserver {
    root = null
    rootMargin = ''
    thresholds: ReadonlyArray<number> = []
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
  // @ts-expect-error - partial polyfill, sufficient for tests
  window.IntersectionObserver = MockIntersectionObserver
  // @ts-expect-error - partial polyfill, sufficient for tests
  global.IntersectionObserver = MockIntersectionObserver
}
