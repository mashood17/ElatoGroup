import { useState, type MouseEvent, type ReactNode } from 'react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export interface ResolvedNavItem {
  label: string
  href: string
  isRoute: boolean
  isActive: boolean
}

interface NavPillProps {
  items: ResolvedNavItem[]
  onItemClick?: (item: ResolvedNavItem, e: MouseEvent<HTMLAnchorElement>) => void
}

/**
 * Capsule nav inspired by the classic "sliding hover cursor" interaction
 * pattern — reworked onto ELATŌ's own tokens (sand/ochre, hairline border,
 * no black/white) rather than copied literally. Two independent animated
 * layers share the pill: a hover cursor (measured per item on mouseenter,
 * spring-eased) and a route-driven active indicator (a small underline that
 * uses a shared `layoutId` so Framer Motion slides it between items on its
 * own whenever the active route changes — no manual position tracking
 * needed for that piece).
 */
export function NavPill({ items, onItemClick }: NavPillProps) {
  const [cursor, setCursor] = useState({ left: 0, width: 0, opacity: 0 })

  return (
    <ul
      className="relative flex items-center gap-1 rounded-full border border-primary-100 bg-surface-elevated/70 p-1.5 backdrop-blur-sm"
      onMouseLeave={() => setCursor((pv) => ({ ...pv, opacity: 0 }))}
    >
      <motion.li
        aria-hidden="true"
        className="absolute inset-y-1.5 left-0 z-0 rounded-full bg-sand"
        animate={{ left: cursor.left, width: cursor.width, opacity: cursor.opacity }}
        transition={{ type: 'spring', stiffness: 350, damping: 28, mass: 0.6 }}
      />
      {items.map((item) => (
        <NavPillItem key={item.href} item={item} setCursor={setCursor} onItemClick={onItemClick} />
      ))}
    </ul>
  )
}

function NavPillItem({
  item,
  setCursor,
  onItemClick,
}: {
  item: ResolvedNavItem
  setCursor: (updater: (pv: { left: number; width: number; opacity: number }) => { left: number; width: number; opacity: number }) => void
  onItemClick?: (item: ResolvedNavItem, e: MouseEvent<HTMLAnchorElement>) => void
}) {
  const ref = useRef<HTMLLIElement>(null)

  const handleEnter = () => {
    const el = ref.current
    if (!el) return
    setCursor(() => ({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 }))
  }

  const content: ReactNode = (
    <span className="relative block px-4 py-2 text-body font-semibold whitespace-nowrap text-secondary-900 transition-colors duration-200">
      {item.label}
      {item.isActive && (
        <motion.span
          layoutId="nav-active-indicator"
          className="absolute inset-x-4 -bottom-0.5 h-[2px] rounded-full bg-secondary-500"
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}
    </span>
  )

  return (
    <li ref={ref} onMouseEnter={handleEnter} className="relative z-10">
      <Link to={item.href} onClick={(e) => onItemClick?.(item, e)}>
        {content}
      </Link>
    </li>
  )
}
