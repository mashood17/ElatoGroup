const KEY = 'elato:visitor-id'

/** Persistent (not per-session) anonymous id — identifies a browser across
 * visits so the scratch-card popup only ever shows once per offer, and so
 * offer registrations carry a stable visitor reference. */
export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return 'unknown'
  }
}
