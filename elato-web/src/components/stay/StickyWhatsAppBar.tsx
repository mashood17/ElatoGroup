import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { businessInfo } from '../../content/siteContent'
import { buildWhatsAppLink } from '../../lib/whatsapp'

/** PRD Ch. 13 — sticky mobile CTA bar, appears once the visitor scrolls past the hero. */
export function StickyWhatsAppBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-primary-100 bg-surface-elevated p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-elato-lg lg:hidden"
        >
          <Button
            as="a"
            variant="whatsapp"
            href={buildWhatsAppLink(businessInfo.whatsappNumber, 'Hi Elato! I would like to check availability for a stay.')}
            target="_blank"
            rel="noreferrer"
            className="w-full"
          >
            Check Availability on WhatsApp
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
