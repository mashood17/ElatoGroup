import { useEffect, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { LogoImage } from '../brand/LogoImage'
import { Button } from '../ui/Button'
import { NavPill, type ResolvedNavItem } from './NavPill'

// `to` items are real routes; `hash` items are anchors on `basePath` (default home).
const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Celebré', to: '/elato-celebre' },
  { label: 'Stay', to: '/elato-stay' },
  { label: 'Events', to: '/elato-events' },
  { label: 'About', hash: '#about' },
  { label: 'Visit', hash: '#visit' },
] as const

const MENU_BASE_PATH = '/elato-celebre'
const MENU_ANCHOR = '#menu'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()

  const menuTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const }

  const menuVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 14, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }
  const isHome = location.pathname === '/'
  const isCelebrePage = location.pathname === MENU_BASE_PATH

  // Section anchors only resolve on the Homepage — elsewhere, route back to it first.
  const resolveHref = (hash: string) => (isHome ? hash : `/${hash}`)

  const resolvedItems: ResolvedNavItem[] = navItems.map((item) =>
    'to' in item
      ? { label: item.label, href: item.to, isRoute: true, isActive: location.pathname === item.to }
      : { label: item.label, href: resolveHref(item.hash), isRoute: false, isActive: false },
  )

  const menuHref = isCelebrePage ? MENU_ANCHOR : `${MENU_BASE_PATH}${MENU_ANCHOR}`
  const handleMenuClick = (e: MouseEvent) => {
    if (isCelebrePage) {
      e.preventDefault()
      document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })
    }
    setMenuOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-200 ease-out ${
          scrolled
            ? 'bg-surface-base/92 shadow-elato-sm backdrop-blur-md'
            : 'bg-transparent'
        } ${
          menuOpen
            ? 'max-lg:border-b max-lg:border-white/40 max-lg:bg-sand-light/40 max-lg:shadow-[0_16px_48px_-12px_rgba(58,46,30,0.16)] max-lg:backdrop-blur-[32px] max-lg:backdrop-saturate-[170%]'
            : ''
        }`}
      >
        <nav className="container-elato flex h-20 items-center justify-between">
          <Link to="/">
            <LogoImage />
          </Link>

          <div className="hidden lg:block">
            <NavPill items={resolvedItems} />
          </div>

          <div className="hidden lg:block">
            <Button
              as="a"
              href={menuHref}
              variant="primary"
              onClick={handleMenuClick}
              className="shadow-elato-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-secondary-700 hover:shadow-elato-lg"
            >
              Our Menu
            </Button>
          </div>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-sand/50 transition-colors hover:bg-sand lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="text-h3 text-secondary-900">{menuOpen ? '✕' : '☰'}</span>
          </button>
        </nav>
      </header>

      {createPortal(
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={menuVariants}
              transition={menuTransition}
              className="fixed inset-0 top-20 z-40 flex flex-col items-center gap-8 bg-sand-light/40 pt-12 shadow-[0_16px_48px_-12px_rgba(58,46,30,0.16)] backdrop-blur-[32px] backdrop-saturate-[170%] lg:hidden"
            >
              {resolvedItems.map((item) => {
                const linkClassName = `text-h3 transition-colors ${
                  item.isActive ? 'text-secondary-500' : 'text-secondary-900'
                }`
                return item.isRoute ? (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={linkClassName}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    className={linkClassName}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                )
              })}
              <Button as="a" href={menuHref} variant="primary" onClick={handleMenuClick}>
                Our Menu
              </Button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
