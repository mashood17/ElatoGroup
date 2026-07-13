import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import type { FeaturedEvent } from '../../content/eventsContent'

/**
 * Click-through detail view for a FeaturedEvents card. Same accessible-modal
 * pattern as Celebré's ItemDetailModal (focus trap, Escape, backdrop-close) —
 * no AnimatePresence, for the same reason: closing must never depend on an
 * exit-animation frame completing.
 */
export function EventDetailModal({ event, onClose }: { event: FeaturedEvent | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<Element | null>(null)

  useEffect(() => {
    if (!event) return
    triggerRef.current = document.activeElement

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    dialogRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus()
    }
  }, [event, onClose])

  if (!event) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-surface-elevated shadow-elato-xl"
      >
        <div
          className="aspect-4/3 w-full rounded-t-lg bg-gradient-to-br from-primary-300 via-primary-100 to-secondary-500"
          aria-hidden="true"
        />
        <div className="p-6 lg:p-8">
          <p className="text-caption text-secondary-500">{event.capacity}</p>
          <h2 className="text-h2 mt-2 text-secondary-900">{event.title}</h2>
          <p className="text-body mt-3 text-neutral-warm-500">{event.description}</p>

          <Button
            as="a"
            variant="primary"
            className="mt-6 w-full"
            href="#events-enquiry"
            onClick={onClose}
          >
            Enquire About {event.title}
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="text-body mt-4 w-full text-center text-neutral-warm-500 hover:text-secondary-500"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
