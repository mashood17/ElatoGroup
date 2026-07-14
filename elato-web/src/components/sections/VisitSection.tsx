import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { businessInfo } from '../../content/siteContent'
import { buildWhatsAppLink } from '../../lib/whatsapp'
import { sectionReveal, viewportOnce } from '../../lib/motion'
import { validateName, validatePhone, validateMessage } from '../../lib/validation'
import { persistEnquiry } from '../../lib/enquiryRepository'
import { trackEvent } from '../../lib/analytics'

const purposes = ['Stay', 'Celebré', 'Events', 'General'] as const

type Errors = Partial<Record<'name' | 'phone' | 'message', string>>

export function VisitSection() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [purpose, setPurpose] = useState<(typeof purposes)[number]>('General')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [mapActive, setMapActive] = useState(false)

  const validate = (): Errors => ({
    name: validateName(name),
    phone: validatePhone(phone),
    message: validateMessage(message),
  })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.values(validationErrors).some(Boolean)) return

    setSubmitting(true)
    setTimeout(() => {
      const waMessage = `Hi Elato! My name is ${name.trim()}. Purpose: ${purpose}. ${message.trim()}`.trim()
      persistEnquiry({
        source_page: 'home',
        name: name.trim(),
        phone: phone.trim(),
        message: `Purpose: ${purpose}. ${message.trim()}`.trim(),
      })
      trackEvent('enquiry_submitted', 'home', { purpose })
      window.open(buildWhatsAppLink(businessInfo.whatsappNumber, waMessage), '_blank', 'noreferrer')
      trackEvent('whatsapp_click', 'home', { purpose })
      setSubmitting(false)
      setSubmitted(true)
    }, 400)
  }

  return (
    <section id="visit" className="bg-surface-base py-12 lg:py-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={sectionReveal}
        className="container-elato grid grid-cols-1 gap-12 lg:grid-cols-2"
      >
        <div className="flex flex-col gap-6">
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-primary-100 shadow-elato-sm">
            {!mapActive ? (
              <button
                type="button"
                onClick={() => setMapActive(true)}
                aria-label="Load an interactive map of ELATŌ CELEBRÉ, Panemangalore"
                className="flex h-full w-full items-center justify-center"
              >
                <span className="text-body font-semibold text-secondary-500">Tap to load map</span>
              </button>
            ) : (
              // No-API-key embed — swap for the Places API "Embed" variant
              // (adds a key param) once one is provisioned; query and output
              // params carry no tracking/session data.
              <iframe
                title="ELATŌ CELEBRÉ, Panemangalore — map location"
                src={`https://www.google.com/maps?q=${encodeURIComponent(businessInfo.address)}&output=embed`}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>

          <div className="text-body text-secondary-900">
            <p className="font-semibold">{businessInfo.address}</p>
            {businessInfo.hours.map((h) => (
              <p key={h.day} className="text-neutral-warm-500">
                {h.day}: {h.time}
              </p>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              as="a"
              variant="whatsapp"
              href={buildWhatsAppLink(businessInfo.whatsappNumber, 'Hi Elato!')}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('whatsapp_click', 'home')}
            >
              Chat on WhatsApp
            </Button>
            <Button as="a" variant="secondary" href={businessInfo.instagramUrl} target="_blank" rel="noreferrer">
              Follow on Instagram
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-surface-elevated p-6 shadow-elato-md lg:p-8">
          <h2 className="text-h2 text-secondary-900">Get in Touch</h2>

          {submitted ? (
            <p className="text-body mt-6 text-success" role="status">
              Thank you — your message has been sent, and WhatsApp should have opened with the details pre-filled.
            </p>
          ) : (
            <form className="mt-6 flex flex-col gap-5" onSubmit={onSubmit} noValidate>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="visit-name" className="text-caption text-neutral-warm-500">Name</label>
                <input
                  id="visit-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setErrors((prev) => ({ ...prev, name: validate().name }))}
                  aria-describedby={errors.name ? 'visit-name-error' : undefined}
                  className="h-12 rounded-md border border-primary-100 px-4 text-body focus-visible:border-secondary-500"
                />
                {errors.name && (
                  <p id="visit-name-error" className="text-caption text-danger" aria-live="polite">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="visit-phone" className="text-caption text-neutral-warm-500">Phone</label>
                <input
                  id="visit-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => setErrors((prev) => ({ ...prev, phone: validate().phone }))}
                  placeholder="+91 98765 43210"
                  aria-describedby={errors.phone ? 'visit-phone-error' : undefined}
                  className="h-12 rounded-md border border-primary-100 px-4 text-body focus-visible:border-secondary-500"
                />
                {errors.phone && (
                  <p id="visit-phone-error" className="text-caption text-danger" aria-live="polite">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="visit-purpose" className="text-caption text-neutral-warm-500">Purpose</label>
                <select
                  id="visit-purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value as (typeof purposes)[number])}
                  className="h-12 rounded-md border border-primary-100 px-4 text-body focus-visible:border-secondary-500"
                >
                  {purposes.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="visit-message" className="text-caption text-neutral-warm-500">Message</label>
                <textarea
                  id="visit-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onBlur={() => setErrors((prev) => ({ ...prev, message: validate().message }))}
                  rows={4}
                  maxLength={500}
                  aria-describedby={errors.message ? 'visit-message-error' : undefined}
                  className="rounded-md border border-primary-100 px-4 py-3 text-body focus-visible:border-secondary-500"
                />
                {errors.message && (
                  <p id="visit-message-error" className="text-caption text-danger" aria-live="polite">
                    {errors.message}
                  </p>
                )}
              </div>

              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send Enquiry'}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  )
}
