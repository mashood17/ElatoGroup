/**
 * Polls (via rAF) for an element to exist in the DOM, up to `timeoutMs`.
 * Used for cross-section deep-links (e.g. Featured Specials → a menu item
 * row) where the target may not be rendered yet — still loading, or hidden
 * behind an active search filter that needs to clear first.
 */
export function waitForElement(id: string, timeoutMs = 3000): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const existing = document.getElementById(id)
    if (existing) {
      resolve(existing)
      return
    }

    const start = performance.now()
    const check = () => {
      const el = document.getElementById(id)
      if (el) {
        resolve(el)
        return
      }
      if (performance.now() - start >= timeoutMs) {
        resolve(null)
        return
      }
      requestAnimationFrame(check)
    }
    requestAnimationFrame(check)
  })
}
