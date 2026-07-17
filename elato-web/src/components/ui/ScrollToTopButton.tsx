import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

const SHOW_AFTER_PX = 480

export function ScrollToTopButton() {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="group fixed bottom-6 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[#e7caa0]/50 bg-secondary-900/95 text-[#e7caa0] shadow-elato-lg backdrop-blur-sm transition-colors duration-300 ease-out hover:border-[#9e7641] hover:bg-secondary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9e7641]/50 sm:bottom-8 sm:right-8 sm:h-14 sm:w-14"
        >
          <span
            className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-[#9e7641]/30 transition-transform duration-300 ease-out group-hover:scale-110"
            aria-hidden="true"
          />
          <ArrowUp className="h-5 w-5 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 sm:h-6 sm:w-6" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
