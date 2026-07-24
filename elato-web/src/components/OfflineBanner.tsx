import { useEffect, useState } from 'react'

/**
 * Thin fixed strip announcing a lost connection — sits above the sticky
 * Navbar (z-50) so it's visible regardless of scroll position. Forms on
 * this site already degrade gracefully offline (WhatsApp handoff still
 * opens; the background `persistEnquiry` call just silently fails), so
 * this is purely informational rather than blocking.
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[60] bg-secondary-900 px-4 py-2 text-center text-caption text-primary-50"
    >
      You&rsquo;re offline — some content may be out of date until your connection returns.
    </div>
  )
}
