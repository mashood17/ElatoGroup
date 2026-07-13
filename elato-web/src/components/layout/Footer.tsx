import { Link, useLocation } from 'react-router-dom'
import { Logo } from '../brand/Logo'
import { businessInfo } from '../../content/siteContent'
import { buildWhatsAppLink } from '../../lib/whatsapp'

export function Footer() {
  const year = new Date().getFullYear()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const homeHash = (hash: string) => (isHome ? hash : `/${hash}`)

  return (
    <footer className="bg-surface-inverse text-primary-50">
      <div className="container-elato grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-4 lg:py-24">
        <div className="flex flex-col gap-4">
          <Link to="/">
            <Logo className="text-white" />
          </Link>
          <p className="text-body text-primary-100">
            Crafting moments worth savoring, in Mangalore.
          </p>
          <div className="flex gap-4 text-body">
            <a href={businessInfo.instagramUrl} className="hover:text-primary-300">
              Instagram
            </a>
            <a
              href={buildWhatsAppLink(businessInfo.whatsappNumber, 'Hi Elato!')}
              className="hover:text-primary-300"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-caption mb-4 text-primary-300">Explore</h3>
          <ul className="flex flex-col gap-2 text-body">
            <li><a href={homeHash('#home')} className="hover:text-primary-300">Home</a></li>
            <li><Link to="/elato-stay" className="hover:text-primary-300">Stay</Link></li>
            <li><Link to="/elato-celebre" className="hover:text-primary-300">Celebré</Link></li>
            <li><Link to="/elato-events" className="hover:text-primary-300">Events</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-caption mb-4 text-primary-300">Visit</h3>
          <ul className="flex flex-col gap-2 text-body text-primary-100">
            <li>{businessInfo.address}</li>
            {businessInfo.hours.map((h) => (
              <li key={h.day}>
                {h.day}: {h.time}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-caption mb-4 text-primary-300">Contact</h3>
          <ul className="flex flex-col gap-2 text-body text-primary-100">
            <li>{businessInfo.phone}</li>
            <li>
              <a
                href={buildWhatsAppLink(businessInfo.whatsappNumber, 'Hi Elato!')}
                className="hover:text-primary-300"
              >
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-secondary-700">
        <div className="container-elato flex flex-col items-center justify-between gap-2 py-6 text-caption text-primary-100 md:flex-row">
          <span>&copy; {year} ELATŌ. All rights reserved.</span>
          <span>Crafted with care</span>
          <a href="#" className="hover:text-primary-300">Privacy</a>
        </div>
      </div>
    </footer>
  )
}
