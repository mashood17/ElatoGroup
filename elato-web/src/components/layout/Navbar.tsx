import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from '../brand/Logo'
import { Button } from '../ui/Button'

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Instagram', href: '#instagram' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Visit', href: '#visit' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  // Section anchors only resolve on the Homepage — elsewhere, route back to it first.
  const resolveHref = (hash: string) => (isHome ? hash : `/${hash}`)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-200 ease-out ${
        scrolled
          ? 'bg-surface-base/92 shadow-elato-sm backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-elato flex h-20 items-center justify-between">
        <Link to="/" className="text-xl">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={resolveHref(item.href)}
                className="text-body font-semibold text-secondary-900 transition-colors hover:text-secondary-500"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Button as="a" href={resolveHref('#visit')} variant="primary">
            Enquire
          </Button>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center lg:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="text-h3 text-secondary-900">{menuOpen ? '✕' : '☰'}</span>
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-20 z-40 flex flex-col items-center gap-8 bg-surface-base pt-12 lg:hidden"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={resolveHref(item.href)}
                className="text-h3 text-secondary-900"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Button
              as="a"
              href={resolveHref('#visit')}
              variant="primary"
              onClick={() => setMenuOpen(false)}
            >
              Enquire
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
