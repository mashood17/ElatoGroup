import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cardHover } from '../../lib/motion'

export function Card({
  children,
  className = '',
  hoverable = true,
}: {
  children: ReactNode
  className?: string
  hoverable?: boolean
}) {
  return (
    <motion.div
      className={`rounded-lg bg-surface-elevated shadow-elato-sm ${className}`}
      initial="rest"
      whileHover={hoverable ? 'hover' : undefined}
      variants={hoverable ? cardHover : undefined}
    >
      {children}
    </motion.div>
  )
}
