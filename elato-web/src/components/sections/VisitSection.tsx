import { useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import { CheckCircle2, Clock, ExternalLink, Mail, MapPin, MessageCircle, MessageSquare, Phone, Tag, User } from 'lucide-react'
import { Button } from '../ui/Button'
import { SectionBackground } from '../ui/SectionBackground'
import { PhoneCountryField } from '../ui/PhoneCountryField'
import { businessInfo } from '../../content/siteContent'
import { visitHeading, visitContact, visitMap } from '../../content/visitContent'
import { buildWhatsAppLink } from '../../lib/whatsapp'
import { viewportOnce } from '../../lib/motion'
import { validateName, validatePhoneForCountry, validateMessage, toE164 } from '../../lib/validation'
import { DEFAULT_COUNTRY_ISO, dialCodeForIso } from '../../lib/countryCodes'
import { persistEnquiry } from '../../lib/enquiryRepository'
import { trackEvent } from '../../lib/analytics'
import sectionBackground from '../../assets/newbg/bg2.webp'
import sectionBackgroundMobile from '../../assets/newbg/bg-mb2.webp'
import mapCover from '../../assets/visit/map.webp'

const purposes = ['Stay', 'Celebré', 'Events', 'General'] as const

type Errors = Partial<Record<'name' | 'phone' | 'message', string>>

const EASE_EDITORIAL = [0.16, 1, 0.3, 1] as const

export function VisitSection() {
  const reduceMotion = useReducedMotion()
  const [name, setName] = useState('')
  const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY_ISO)
  const [phone, setPhone] = useState('')
  const [purpose, setPurpose] = useState<(typeof purposes)[number]>('General')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [mapActive, setMapActive] = useState(false)

  const validate = (): Errors => ({
    name: validateName(name),
    phone: validatePhoneForCountry(dialCodeForIso(countryIso), phone),
    message: validateMessage(message),
  })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.values(validationErrors).some(Boolean)) return

    setSubmitting(true)
    setTimeout(() => {
      const fullPhone = toE164(dialCodeForIso(countryIso), phone)
      const waMessage = `Hi Elato! My name is ${name.trim()}. Purpose: ${purpose}. ${message.trim()}`.trim()
      persistEnquiry({
        source_page: 'home',
        name: name.trim(),
        phone: fullPhone,
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
    setCountryIso(DEFAULT_COUNTRY_ISO)
    setPhone('')
    setPurpose('General')
    setMessage('')
    setErrors({})
    setSubmitted(false)
  }

  // Every field here is a flat useState, so any keystroke in the form below
  // re-renders this whole section — memoizing these on `reduceMotion` (the
  // only thing they actually depend on) stops them from being reallocated
  // on every one of those re-renders while still reacting correctly if the
  // OS-level reduced-motion setting changes mid-session.
  const headingReveal: Variants = useMemo(
    () => ({
      hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_EDITORIAL } },
    }),
    [reduceMotion],
  )

  const columnsContainer: Variants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: { staggerChildren: reduceMotion ? 0 : 0.15, delayChildren: reduceMotion ? 0 : 0.1 },
      },
    }),
    [reduceMotion],
  )

  const columnReveal: Variants = useMemo(
    () => ({
      hidden: { opacity: 0, y: reduceMotion ? 0 : 28 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_EDITORIAL } },
    }),
    [reduceMotion],
  )

  const inputClasses =
    'h-12 w-full rounded-xl border border-[#9e7641]/25 bg-surface-base/60 pl-10 pr-4 text-body transition-colors focus-visible:border-[#9e7641] focus-visible:bg-surface-base'
  const iconClasses = 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9e7641]/60'

  return (
    <motion.section
      id="visit"
      className="relative pb-16 pt-8 font-sans lg:pb-24 lg:pt-12"
    >
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
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={viewportOnce}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="relative aspect-4/3 w-full"
            >
              <div className="absolute -inset-3 rounded-[44px] bg-primary-50/80" aria-hidden="true" />
              <div className="relative h-full w-full overflow-hidden rounded-[36px] border-[10px] border-secondary-900 ring-4 ring-surface-elevated bg-[#E7CAA0]/10 shadow-elato-lg backdrop-blur-sm lg:rounded-[48px] lg:border-[14px]">
                {!mapActive ? (
                  <button
                    type="button"
                    onClick={() => setMapActive(true)}
                    aria-label="Load an interactive map of ELATŌ CELEBRÉ, Panemangalore"
                    className="relative flex h-full w-full items-end justify-center overflow-hidden"
                  >
                    <img
                      src={mapCover}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/60 via-secondary-900/10 to-transparent transition-colors duration-300 ease-out group-hover:from-secondary-900/70" />
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
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={viewportOnce}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="relative"
            >
              <div className="absolute -inset-3 rounded-[44px] bg-primary-50/80" aria-hidden="true" />
              <div className="relative flex flex-col gap-3 overflow-hidden rounded-[36px] border-[10px] border-secondary-900 ring-4 ring-surface-elevated bg-surface-elevated/95 p-5 shadow-elato-lg backdrop-blur-sm lg:rounded-[48px] lg:border-[14px]">
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
              </div>
            </motion.div>

            <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-center">
              <Button
                as="a"
                variant="whatsapp"
                href={buildWhatsAppLink(visitContact.whatsappNumber, 'Hi Elato!')}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('whatsapp_click', 'home')}
                className="w-full max-w-xs transition-transform duration-200 ease-out hover:-translate-y-0.5 lg:w-auto lg:max-w-none"
              >
                Chat on WhatsApp
              </Button>
              <Button
                as="a"
                variant="secondary"
                href={businessInfo.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full max-w-xs transition-transform duration-200 ease-out hover:-translate-y-0.5 lg:w-auto lg:max-w-none"
              >
                Follow on Instagram
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative h-full"
          >
          <div className="absolute -inset-3 rounded-[44px] bg-primary-50/80" aria-hidden="true" />
          <div className="relative flex h-full flex-col overflow-hidden rounded-[36px] border-[10px] border-secondary-900 ring-4 ring-surface-elevated bg-surface-elevated/95 p-6 shadow-elato-lg backdrop-blur-sm lg:rounded-[48px] lg:border-[14px] lg:p-8">
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
                  <div className="relative">
                    <User className={iconClasses} aria-hidden="true" />
                    <input
                      id="visit-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setErrors((prev) => ({ ...prev, name: validate().name }))}
                      aria-describedby={errors.name ? 'visit-name-error' : undefined}
                      className={inputClasses}
                    />
                  </div>
                  {errors.name && (
                    <p id="visit-name-error" className="text-caption text-danger" aria-live="polite">
                      {errors.name}
                    </p>
                  )}
                </div>

                <PhoneCountryField
                  idPrefix="visit"
                  label="Phone"
                  countryIso={countryIso}
                  onCountryChange={setCountryIso}
                  phone={phone}
                  onPhoneChange={setPhone}
                  onBlur={() => setErrors((prev) => ({ ...prev, phone: validate().phone }))}
                  error={errors.phone}
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="visit-purpose" className="text-caption text-neutral-warm-500">Purpose</label>
                  <div className="relative">
                    <Tag className={iconClasses} aria-hidden="true" />
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
                </div>

                <div className="flex flex-1 flex-col gap-1.5">
                  <label htmlFor="visit-message" className="text-caption text-neutral-warm-500">Message</label>
                  <div className="relative flex-1">
                    <MessageSquare className="pointer-events-none absolute left-3.5 top-4 h-4 w-4 text-[#9e7641]/60" aria-hidden="true" />
                    <textarea
                      id="visit-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onBlur={() => setErrors((prev) => ({ ...prev, message: validate().message }))}
                      rows={4}
                      maxLength={500}
                      aria-describedby={errors.message ? 'visit-message-error' : undefined}
                      className="h-full min-h-[100px] w-full resize-none rounded-xl border border-[#9e7641]/25 bg-surface-base/60 py-3 pl-10 pr-4 text-body transition-colors focus-visible:border-[#9e7641] focus-visible:bg-surface-base"
                    />
                  </div>
                  {errors.message && (
                    <p id="visit-message-error" className="text-caption text-danger" aria-live="polite">
                      {errors.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  icon={<MessageCircle className="h-4 w-4" />}
                  disabled={submitting}
                  className="w-full !rounded-xl !bg-[#9e7641] tracking-wide hover:!bg-[#8a6636]"
                >
                  {submitting ? 'Sending…' : 'Send Enquiry'}
                </Button>
              </motion.form>
            )}
            </AnimatePresence>
          </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}
