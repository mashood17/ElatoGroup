import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useModalFocusTrap } from '../../../lib/useModalFocusTrap'

type DetailModalShellProps = {
  open: boolean
  ariaLabel: string
  onClose: () => void
  /** Shows a centered "Loading…" state instead of children. */
  loading?: boolean
  children: ReactNode
}

/**
 * The dialog chrome shared by every detail popup on the Célébré page (menu
 * items, Featured Specials) — same overlay, card size, and focus-trap
 * behavior everywhere, so the two can never drift apart in size again.
 */
export function DetailModalShell({ open, ariaLabel, onClose, loading, children }: DetailModalShellProps) {
  const dialogRef = useModalFocusTrap(open, onClose)

  if (!open) return null

  return (
    // No AnimatePresence here on purpose: an exit animation gates React's
    // unmount on the transition completing, which — if a browser ever
    // stalls animation frames for this tab — would leave the modal stuck
    // open. The entrance still animates; closing is instant and reliable.
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] overflow-y-auto bg-secondary-900/60 p-4 pt-28 pb-[max(2rem,env(safe-area-inset-bottom))] backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="mx-auto max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg bg-surface-elevated shadow-elato-xl"
      >
        {loading ? <p className="text-body p-10 text-center text-neutral-warm-500">Loading…</p> : children}
      </motion.div>
    </motion.div>
  )
}
