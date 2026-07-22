import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { LogoImage } from '../brand/LogoImage'
import { Button } from '../ui/Button'
import { NavPill, type ResolvedNavItem } from './NavPill'
import { useScrollPast } from '../../lib/useScrollPast'
import { useServicesSceneActive } from '../../lib/useServicesSceneActive'
import { setNavbarLogoEl, useSplashActive } from '../../lib/splashState'
import elatoWordmark from '../../assets/logos/elato-wordmark.webp'
import celebreWordmark from '../../assets/logos/celebre.webp'
import eventsStayWordmark from '../../assets/logos/events_stay.webp'

// Per-route navbar wordmark — same rendered height everywhere (LogoImage's
// own default className), only the asset changes.
const ROUTE_LOGOS: Record<string, string> = {
  '/elato-celebre': celebreWordmark,
  '/elato-stay': eventsStayWordmark,
  '/elato-events': eventsStayWordmark,
}

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

const SCROLLED_THRESHOLD = 64
const getScrolledThreshold = () => SCROLLED_THRESHOLD

export function Navbar() {
  const scrolled = useScrollPast(getScrolledThreshold)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()

  // Hidden entirely while the Services section is the active full-screen
  // scene — shared signal with the floating buttons (see
  // useServicesSceneActive). Opacity-only on a fixed header, so nothing
  // reflows either way.
  const servicesActive = useServicesSceneActive()
  const splashActive = useSplashActive()
  const navHidden = (servicesActive && !menuOpen) || splashActive

  const isHome = location.pathname === '/'
  const isCelebrePage = location.pathname === MENU_BASE_PATH
  const logoSrc = ROUTE_LOGOS[location.pathname] ?? elatoWordmark

  // Registers this exact <img> so the splash can measure its resting
  // position/size and fly its own wordmark there on exit.
  const logoImgRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    setNavbarLogoEl(logoImgRef.current)
    return () => setNavbarLogoEl(null)
  }, [])

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

  // Very subtle device-tilt parallax on the ambient blobs behind the panel.
  // No-ops (and never prompts for permission) on browsers that gate
  // deviceorientation behind an explicit user gesture, e.g. iOS Safari.
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const springTiltX = useSpring(tiltX, { stiffness: 40, damping: 22, mass: 0.6 })
  const springTiltY = useSpring(tiltY, { stiffness: 40, damping: 22, mass: 0.6 })

  useEffect(() => {
    if (!menuOpen || prefersReducedMotion) return
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma ?? 0
      const beta = e.beta ?? 0
      tiltX.set(Math.max(-6, Math.min(6, gamma / 6)))
      tiltY.set(Math.max(-6, Math.min(6, (beta - 40) / 8)))
    }
    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [menuOpen, prefersReducedMotion, tiltX, tiltY])

  // Transform/opacity only — no animated `filter: blur()`. The static
  // backdrop-blur on the panel already delivers the glass look; animating a
  // second, full-panel blur filter on top of it forced a repeated
  // rasterization pass of everything behind the glass on every frame of the
  // open/close transition (confirmed via runtime profiling as the dominant
  // cost of menu toggle: 16 long tasks / ~13.2s blocked main thread, worst
  // frame 8.7s, under 4x CPU throttle).
  const panelVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: {
          opacity: 0,
          scale: 0.97,
          transition: {
            duration: 0.32,
            ease: [0.4, 0, 1, 1] as const,
            when: 'afterChildren' as const,
            staggerChildren: 0.03,
            staggerDirection: -1,
          },
        },
        visible: {
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1] as const,
            when: 'beforeChildren' as const,
            staggerChildren: 0.06,
            delayChildren: 0.12,
          },
        },
      }

  const itemVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 16, transition: { duration: 0.26, ease: [0.4, 0, 1, 1] as const } },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
      }

  return (
    <>
      <header
        aria-hidden={navHidden || undefined}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out ${
          navHidden ? 'pointer-events-none opacity-0' : 'opacity-100'
        } ${
          scrolled
            ? 'bg-surface-base/92 shadow-elato-sm backdrop-blur-[4px]'
            : 'bg-transparent'
        } ${
          menuOpen
            ? 'max-lg:border-b max-lg:border-ochre/20 max-lg:bg-gradient-to-b max-lg:from-sand-light/55 max-lg:via-sand-light/42 max-lg:to-sand-light/32 max-lg:shadow-[0_12px_36px_-16px_rgba(58,46,30,0.22)] max-lg:backdrop-blur-[6px] max-lg:backdrop-saturate-[120%]'
            : ''
        }`}
      >
        <nav className="container-elato flex h-20 items-center justify-between">
          <Link to="/">
            <LogoImage ref={logoImgRef} src={logoSrc} className={isHome ? 'h-[3.28125rem]' : 'h-[4.375rem]'} />
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
            className={`relative flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ease-out lg:hidden ${
              menuOpen
                ? 'border-ochre/45 bg-ochre/10 shadow-[0_4px_16px_-4px_rgba(148,113,43,0.35)]'
                : 'border-ochre/20 bg-sand-light/45 hover:border-ochre/35 hover:bg-sand-light/65'
            }`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <motion.span
              className="relative flex h-4 w-5 flex-col items-center justify-center"
              animate={{ rotate: menuOpen ? 90 : 0, scale: menuOpen ? 1.05 : 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.span
                className="absolute h-[1.5px] w-5 rounded-full bg-ink"
                animate={menuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -5.5 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.span
                className="absolute h-[1.5px] w-5 rounded-full bg-ink"
                animate={menuOpen ? { opacity: 0, scale: 0.4 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="absolute h-[1.5px] w-5 rounded-full bg-ink"
                animate={menuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 5.5 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.span>
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
              variants={panelVariants}
              className="fixed inset-0 top-20 z-40 overflow-hidden border border-ochre/20 bg-gradient-to-b from-sand-light/40 via-sand-light/28 to-sand/24 shadow-[inset_0_1px_0_rgba(255,252,240,0.4),0_20px_56px_-18px_rgba(58,46,30,0.25)] backdrop-blur-[6px] backdrop-saturate-[115%] lg:hidden"
            >
              {/* Ambient floating gradients, tilted very slightly by device motion */}
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ x: springTiltX, y: springTiltY }}
              >
                <div className="mobile-nav-blob-a absolute -left-20 -top-16 h-64 w-64 rounded-full bg-ochre/15 blur-[30px]" />
                <div className="mobile-nav-blob-b absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-tan/22 blur-[34px]" />
                <div className="mobile-nav-blob-c absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-sand/28 blur-[30px]" />
              </motion.div>

              {/* Occasional soft light reflection sweeping across the glass */}
              <div aria-hidden="true" className="mobile-nav-sheen" />

              <div className="relative flex h-full flex-col items-center overflow-y-auto px-8 pb-10 pt-4 sm:px-10">
                <nav aria-label="Mobile" className="flex flex-1 flex-col items-center justify-center gap-9">
                  {resolvedItems.map((item) => {
                    const inner = (
                      <>
                        {item.label}
                        <span
                          aria-hidden="true"
                          className={`absolute -bottom-1.5 left-1/2 h-px -translate-x-1/2 bg-ochre transition-all duration-300 ease-out ${
                            item.isActive ? 'w-8 opacity-90' : 'w-0 opacity-0 group-hover:w-8 group-hover:opacity-70'
                          }`}
                        />
                      </>
                    )
                    const itemClassName = `group relative inline-block px-2 py-1 font-sans text-[22px] font-semibold tracking-tight transition-all duration-300 ease-out hover:scale-[1.02] hover:text-ochre hover:drop-shadow-[0_0_18px_rgba(148,113,43,0.32)] active:scale-[1.02] ${
                      item.isActive ? 'text-ochre' : 'text-ink'
                    }`

                    return (
                      <motion.div key={item.href} variants={itemVariants}>
                        <Link to={item.href} className={itemClassName} onClick={() => setMenuOpen(false)}>
                          {inner}
                        </Link>
                      </motion.div>
                    )
                  })}
                </nav>

                <motion.div variants={itemVariants} className="pt-6">
                  <motion.a
                    href={menuHref}
                    onClick={handleMenuClick}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full border border-ochre/40 bg-gradient-to-b from-ochre to-secondary-700 px-12 text-body font-sans font-semibold tracking-wide text-white shadow-[0_10px_28px_-8px_rgba(148,113,43,0.5)] transition-shadow duration-300 ease-out hover:shadow-[0_16px_36px_-6px_rgba(148,113,43,0.6)]"
                  >
                    <span className="relative z-10">Our Menu</span>
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                  </motion.a>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
