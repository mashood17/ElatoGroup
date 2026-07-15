import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import { CheckCircle2, Clock, ExternalLink, Mail, MapPin, Phone } from 'lucide-react'
import { Button } from '../ui/Button'
import { SectionBackground } from '../ui/SectionBackground'
import { businessInfo } from '../../content/siteContent'
import { visitHeading, visitContact, visitMap } from '../../content/visitContent'
import { buildWhatsAppLink } from '../../lib/whatsapp'
import { viewportOnce } from '../../lib/motion'
import { validateName, validatePhone10, validateMessage } from '../../lib/validation'
import { persistEnquiry } from '../../lib/enquiryRepository'
import { trackEvent } from '../../lib/analytics'
import sectionBackground from '../../assets/newbg/bg2.png'
import sectionBackgroundMobile from '../../assets/newbg/bg-mb2.png'

const purposes = ['Stay', 'Celebré', 'Events', 'General'] as const

type Errors = Partial<Record<'name' | 'phone' | 'message', string>>

const EASE_EDITORIAL = [0.16, 1, 0.3, 1] as const

export function VisitSection() {
  const reduceMotion = useReducedMotion()
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
    phone: validatePhone10(phone),
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
      window.open(buildWhatsAppLink(visitContact.whatsappNumber, waMessage), '_blank', 'noreferrer')
      trackEvent('whatsapp_click', 'home', { purpose })
      setSubmitting(false)
      setSubmitted(true)
    }, 400)
  }

  const resetForm = () => {
    setName('')
    setPhone('')
    setPurpose('General')
    setMessage('')
    setErrors({})
    setSubmitted(false)
  }

  const headingReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_EDITORIAL } },
  }

  const columnsContainer: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.15, delayChildren: reduceMotion ? 0 : 0.1 },
    },
  }

  const columnReveal: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_EDITORIAL } },
  }

  const inputClasses =
    'h-12 rounded-lg border border-[#E7CAA0]/60 px-4 text-body transition-colors duration-200 ease-out focus-visible:border-[#9E7641] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9E7641]/20'

  return (
    <section id="visit" className="relative pb-16 pt-8 font-sans lg:pb-24 lg:pt-12">
      <SectionBackground image={sectionBackground} mobileImage={sectionBackgroundMobile} />

      <div className="container-elato">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={headingReveal}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-caption text-[#9E7641]">{visitHeading.overline}</p>
          <span className="mx-auto mt-2 block h-px w-10 bg-[#E7CAA0]" aria-hidden="true" />
          <h2 className="mt-3 text-[28px] font-bold leading-tight text-[#9E7641] lg:text-[42px]">
            {visitHeading.title}
          </h2>
          <p className="text-body mt-3 text-neutral-warm-500">{visitHeading.description}</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={columnsContainer}
          className="mt-12 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-14"
        >
          <motion.div variants={columnReveal} className="flex flex-col gap-6">
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
              className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border-2 border-[#9E7641]/40 bg-[#E7CAA0]/10 shadow-[0_8px_30px_rgba(158,118,65,0.12)] transition-[box-shadow,border-color] duration-300 ease-out hover:border-[#9E7641] hover:shadow-[0_20px_45px_rgba(158,118,65,0.25)]"
            >
              {!mapActive ? (
                <button
                  type="button"
                  onClick={() => setMapActive(true)}
                  aria-label="Load an interactive map of ELATŌ CELEBRÉ, Panemangalore"
                  className="flex h-full w-full flex-col items-center justify-center gap-3 transition-colors duration-300 ease-out hover:bg-[#E7CAA0]/15"
                >
                  <MapPin className="h-8 w-8 text-[#9E7641]" aria-hidden="true" />
                  <span className="text-body font-semibold text-[#9E7641]">Tap to view interactive map</span>
                </button>
              ) : (
                // No-API-key embed — swap for the Places API "Embed" variant
                // (adds a key param) once one is provisioned; query and ftid
                // pin the exact place with no tracking/session data.
                <iframe
                  title="ELATŌ CELEBRÉ, Panemangalore — map location"
                  src={visitMap.embedSrc}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
            </motion.div>

            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
              className="flex flex-col gap-3 rounded-2xl border-2 border-[#9E7641]/40 bg-surface-elevated p-5 shadow-[0_8px_30px_rgba(158,118,65,0.12)] transition-[box-shadow,border-color] duration-300 ease-out hover:border-[#9E7641] hover:shadow-[0_20px_45px_rgba(158,118,65,0.25)]"
            >
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#9E7641]" aria-hidden="true" />
                <p className="text-body text-secondary-900">{visitContact.address}</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#9E7641]" aria-hidden="true" />
                <p className="text-body text-secondary-900">
                  {visitContact.hours.day} · {visitContact.hours.time}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#9E7641]" aria-hidden="true" />
                <p className="text-body text-secondary-900">{visitContact.phoneDisplay}</p>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#9E7641]" aria-hidden="true" />
                <p className="text-body text-secondary-900">{businessInfo.email}</p>
              </div>
              <a
                href={visitMap.openUrl}
                target="_blank"
                rel="noreferrer"
                className="group/link mt-1 inline-flex w-fit items-center gap-1.5 text-caption font-semibold text-[#9E7641]"
              >
                Open in Maps
                <ExternalLink className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/link:translate-x-0.5" />
              </a>
            </motion.div>

            <div className="flex flex-wrap gap-4">
              <Button
                as="a"
                variant="whatsapp"
                href={buildWhatsAppLink(visitContact.whatsappNumber, 'Hi Elato!')}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('whatsapp_click', 'home')}
                className="transition-transform duration-200 ease-out hover:-translate-y-0.5"
              >
                Chat on WhatsApp
              </Button>
              <Button
                as="a"
                variant="secondary"
                href={businessInfo.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="transition-transform duration-200 ease-out hover:-translate-y-0.5"
              >
                Follow on Instagram
              </Button>
            </div>
          </motion.div>

          <motion.div
            variants={columnReveal}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
            className="flex flex-col rounded-2xl border-2 border-[#9E7641]/40 bg-surface-elevated p-6 shadow-[0_8px_30px_rgba(158,118,65,0.12)] transition-[box-shadow,border-color] duration-300 ease-out hover:border-[#9E7641] hover:shadow-[0_20px_45px_rgba(158,118,65,0.25)] lg:p-8"
          >
            <h3 className="text-center text-[26px] font-bold tracking-tight text-[#9E7641] lg:text-[30px]">Get in Touch</h3>

            <AnimatePresence mode="wait" initial={false}>
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
                className="mt-6 flex flex-1 flex-col items-start justify-center gap-4"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#9E7641]" aria-hidden="true" />
                  <p className="text-body-lg font-semibold text-secondary-900">Message Sent</p>
                </div>
                <p className="text-body text-neutral-warm-500" role="status">
                  Thank you — your message has been sent, and WhatsApp should have opened with the details pre-filled.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                  className="transition-transform duration-200 ease-out hover:-translate-y-0.5"
                >
                  Send Another Message
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
                className="mt-6 flex flex-1 flex-col gap-5" onSubmit={onSubmit} noValidate>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="visit-name" className="text-caption text-neutral-warm-500">Name</label>
                  <input
                    id="visit-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setErrors((prev) => ({ ...prev, name: validate().name }))}
                    aria-describedby={errors.name ? 'visit-name-error' : undefined}
                    className={inputClasses}
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
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onBlur={() => setErrors((prev) => ({ ...prev, phone: validate().phone }))}
                    placeholder="98765 43210"
                    maxLength={10}
                    aria-describedby={errors.phone ? 'visit-phone-error' : undefined}
                    className={inputClasses}
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
                    className={inputClasses}
                  >
                    {purposes.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-1 flex-col gap-1.5">
                  <label htmlFor="visit-message" className="text-caption text-neutral-warm-500">Message</label>
                  <textarea
                    id="visit-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onBlur={() => setErrors((prev) => ({ ...prev, message: validate().message }))}
                    rows={4}
                    maxLength={500}
                    aria-describedby={errors.message ? 'visit-message-error' : undefined}
                    className="flex-1 min-h-[100px] resize-none rounded-lg border border-[#E7CAA0]/60 px-4 py-3 text-body transition-colors duration-200 ease-out focus-visible:border-[#9E7641] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9E7641]/20"
                  />
                  {errors.message && (
                    <p id="visit-message-error" className="text-caption text-danger" aria-live="polite">
                      {errors.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className="transition-transform duration-200 ease-out hover:-translate-y-0.5"
                >
                  {submitting ? 'Sending…' : 'Send Enquiry'}
                </Button>
              </motion.form>
            )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
