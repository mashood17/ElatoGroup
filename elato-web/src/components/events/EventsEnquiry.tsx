import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { businessInfo } from '../../content/siteContent'
import { buildWhatsAppLink } from '../../lib/whatsapp'
import { sectionReveal, viewportOnce } from '../../lib/motion'
import {
  validateName,
  validatePhone,
  validateEmail,
  validateMessage,
  validateFutureDate,
  validateGuests,
} from '../../lib/validation'

const EVENT_TYPES = [
  'Wedding',
  'Engagement',
  'Birthday Party',
  'Naming Ceremony',
  'Corporate Event',
  'Family Gathering',
  'Cultural Event',
  'Anniversary Celebration',
] as const

const GUEST_MIN = 1
const GUEST_MAX = 250

type Errors = Partial<
  Record<'name' | 'phone' | 'email' | 'date' | 'guests' | 'message', string>
>

export function EventsEnquiry() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [eventType, setEventType] = useState<(typeof EVENT_TYPES)[number]>(EVENT_TYPES[0])
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState(GUEST_MIN)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const validate = (): Errors => ({
    name: validateName(name),
    phone: validatePhone(phone),
    email: validateEmail(email),
    date: validateFutureDate(date),
    guests: validateGuests(guests, GUEST_MIN, GUEST_MAX),
    message: validateMessage(message),
  })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.values(validationErrors).some(Boolean)) return

    setSubmitting(true)
    // No backend in this pass — simulate the request, then reveal success and
    // open the pre-filled WhatsApp deep-link (PRD Ch. 39 Events composition).
    setTimeout(() => {
      const waMessage =
        `Hi Elato! My name is ${name.trim()}. I'd like to enquire about hosting a ${eventType} ` +
        `for ${guests} guest${guests > 1 ? 's' : ''} on ${date}. Contact: ${phone.trim()}. ${message.trim()}`.trim()
      window.open(buildWhatsAppLink(businessInfo.whatsappNumber, waMessage), '_blank', 'noreferrer')
      setSubmitting(false)
      setSubmitted(true)
    }, 400)
  }

  return (
    <section id="events-enquiry" className="bg-surface-base py-16 lg:py-32">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={sectionReveal}
        className="container-elato mx-auto max-w-2xl"
      >
        <div className="mb-10 text-center">
          <p className="text-caption text-secondary-500">Plan Your Celebration</p>
          <h2 className="text-h2 mt-2 text-secondary-900">Enquire Directly</h2>
        </div>

        <div className="rounded-lg bg-surface-elevated p-6 shadow-elato-md lg:p-10">
          {submitted ? (
            <p className="text-body text-success" role="status">
              Thank you — your enquiry has been sent, and WhatsApp should have opened with the details pre-filled.
            </p>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field
                  id="events-name"
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={setName}
                  onBlur={() => setErrors((prev) => ({ ...prev, name: validate().name }))}
                  error={errors.name}
                />
                <Field
                  id="events-phone"
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  onBlur={() => setErrors((prev) => ({ ...prev, phone: validate().phone }))}
                  error={errors.phone}
                  placeholder="+91 98765 43210"
                />
              </div>

              <Field
                id="events-email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                onBlur={() => setErrors((prev) => ({ ...prev, email: validate().email }))}
                error={errors.email}
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="events-type" className="text-caption text-neutral-warm-500">
                  Event Type
                </label>
                <select
                  id="events-type"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as (typeof EVENT_TYPES)[number])}
                  className="h-12 rounded-md border border-primary-100 px-4 text-body focus-visible:border-secondary-500"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field
                  id="events-date"
                  label="Preferred Date"
                  type="date"
                  value={date}
                  onChange={setDate}
                  onBlur={() => setErrors((prev) => ({ ...prev, date: validate().date }))}
                  error={errors.date}
                />
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="events-guests" className="text-caption text-neutral-warm-500">
                    Number of Guests
                  </label>
                  <input
                    id="events-guests"
                    type="number"
                    min={GUEST_MIN}
                    max={GUEST_MAX}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    onBlur={() => setErrors((prev) => ({ ...prev, guests: validate().guests }))}
                    aria-describedby={errors.guests ? 'events-guests-error' : undefined}
                    className="h-12 rounded-md border border-primary-100 px-4 text-body focus-visible:border-secondary-500"
                  />
                  {errors.guests && (
                    <p id="events-guests-error" className="text-caption text-danger" aria-live="polite">
                      {errors.guests}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="events-message" className="text-caption text-neutral-warm-500">
                  Message
                </label>
                <textarea
                  id="events-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onBlur={() => setErrors((prev) => ({ ...prev, message: validate().message }))}
                  rows={4}
                  maxLength={500}
                  aria-describedby={errors.message ? 'events-message-error' : undefined}
                  className="rounded-md border border-primary-100 px-4 py-3 text-body focus-visible:border-secondary-500"
                />
                {errors.message && (
                  <p id="events-message-error" className="text-caption text-danger" aria-live="polite">
                    {errors.message}
                  </p>
                )}
              </div>

              <Button type="submit" variant="whatsapp" disabled={submitting}>
                {submitting ? 'Sending…' : 'Enquire on WhatsApp'}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  )
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
}: {
  id: string
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  onBlur: () => void
  error?: string
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-caption text-neutral-warm-500">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-12 rounded-md border border-primary-100 px-4 text-body focus-visible:border-secondary-500"
      />
      {error && (
        <p id={`${id}-error`} className="text-caption text-danger" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  )
}
