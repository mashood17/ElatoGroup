import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { EventsGalleryTile } from './EventsGalleryItem'

/** Click-to-enlarge lightbox for the events gallery — same accessible-modal pattern as the other detail modals. */
export function EventsLightbox({ item, onClose }: { item: EventsGalleryTile | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<Element | null>(null)

  useEffect(() => {
    if (!item) return
    triggerRef.current = document.activeElement

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    dialogRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus()
    }
  }, [item, onClose])

  if (!item) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={item.category ? `${item.category}: ${item.caption}` : item.caption}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-lg bg-surface-elevated shadow-elato-xl"
      >
        {item.url ? (
          <img src={item.url} alt={item.caption} className="aspect-4/3 w-full object-cover" />
        ) : (
          <div
            className="aspect-4/3 w-full bg-gradient-to-br from-primary-300 via-primary-100 to-secondary-500"
            aria-hidden="true"
          />
        )}
        <div className="flex items-center justify-between p-6">
          <div>
            {item.category && <p className="text-caption text-secondary-500">{item.category}</p>}
            <p className="text-body mt-1 text-secondary-900">{item.caption}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-neutral-warm-500 hover:text-secondary-500"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
