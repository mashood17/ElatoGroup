import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { businessInfo } from '../../content/siteContent'
import { STAY_GUEST_MIN, STAY_GUEST_MAX } from '../../content/stayContent'
import { buildWhatsAppLink } from '../../lib/whatsapp'
import { sectionReveal, viewportOnce } from '../../lib/motion'
import {
  validateName,
  validatePhone,
  validateEmail,
  validateMessage,
  validateDateRange,
  validateGuests,
} from '../../lib/validation'

type Errors = Partial<
  Record<'name' | 'phone' | 'email' | 'checkIn' | 'checkOut' | 'guests' | 'message', string>
>

export function BookingEnquiry() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(STAY_GUEST_MIN)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const validate = (): Errors => {
    const dateErrors = validateDateRange(checkIn, checkOut)
    return {
      name: validateName(name),
      phone: validatePhone(phone),
      email: validateEmail(email),
      checkIn: dateErrors.checkIn,
      checkOut: dateErrors.checkOut,
      guests: validateGuests(guests, STAY_GUEST_MIN, STAY_GUEST_MAX),
      message: validateMessage(message),
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.values(validationErrors).some(Boolean)) return

    setSubmitting(true)
    // No backend in this pass — simulate the request, then reveal success and
    // open the pre-filled WhatsApp deep-link (PRD Ch. 39 "Stay booking enquiry").
    setTimeout(() => {
      const waMessage =
        `Hi Elato! My name is ${name.trim()}. I'd like to check availability for ` +
        `${checkIn} to ${checkOut}, ${guests} guest${guests > 1 ? 's' : ''}. ${message.trim()}`.trim()
      window.open(buildWhatsAppLink(businessInfo.whatsappNumber, waMessage), '_blank', 'noreferrer')
      setSubmitting(false)
      setSubmitted(true)
    }, 400)
  }

  return (
    <section id="booking" className="bg-surface-base py-16 lg:py-32">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={sectionReveal}
        className="container-elato mx-auto max-w-2xl"
      >
        <div className="mb-10 text-center">
          <p className="text-caption text-secondary-500">Reserve Your Stay</p>
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
                  id="booking-name"
                  label="Name"
                  type="text"
                  value={name}
                  onChange={setName}
                  onBlur={() => setErrors((prev) => ({ ...prev, name: validate().name }))}
                  error={errors.name}
                />
                <Field
                  id="booking-phone"
                  label="Phone"
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  onBlur={() => setErrors((prev) => ({ ...prev, phone: validate().phone }))}
                  error={errors.phone}
                  placeholder="+91 98765 43210"
                />
              </div>

              <Field
                id="booking-email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                onBlur={() => setErrors((prev) => ({ ...prev, email: validate().email }))}
                error={errors.email}
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <Field
                  id="booking-checkin"
                  label="Check-in"
                  type="date"
                  value={checkIn}
                  onChange={setCheckIn}
                  onBlur={() => setErrors((prev) => ({ ...prev, checkIn: validate().checkIn }))}
                  error={errors.checkIn}
                />
                <Field
                  id="booking-checkout"
                  label="Check-out"
                  type="date"
                  value={checkOut}
                  onChange={setCheckOut}
                  onBlur={() => setErrors((prev) => ({ ...prev, checkOut: validate().checkOut }))}
                  error={errors.checkOut}
                />
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="booking-guests" className="text-caption text-neutral-warm-500">
                    Guests
                  </label>
                  <input
                    id="booking-guests"
                    type="number"
                    min={STAY_GUEST_MIN}
                    max={STAY_GUEST_MAX}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    onBlur={() => setErrors((prev) => ({ ...prev, guests: validate().guests }))}
                    aria-describedby={errors.guests ? 'booking-guests-error' : undefined}
                    className="h-12 rounded-md border border-primary-100 px-4 text-body focus-visible:border-secondary-500"
                  />
                  {errors.guests && (
                    <p id="booking-guests-error" className="text-caption text-danger" aria-live="polite">
                      {errors.guests}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="booking-message" className="text-caption text-neutral-warm-500">
                  Message
                </label>
                <textarea
                  id="booking-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onBlur={() => setErrors((prev) => ({ ...prev, message: validate().message }))}
                  rows={4}
                  maxLength={500}
                  aria-describedby={errors.message ? 'booking-message-error' : undefined}
                  className="rounded-md border border-primary-100 px-4 py-3 text-body focus-visible:border-secondary-500"
                />
                {errors.message && (
                  <p id="booking-message-error" className="text-caption text-danger" aria-live="polite">
                    {errors.message}
                  </p>
                )}
              </div>

              <div className="mt-2 flex flex-col items-center gap-4">
                <Button type="submit" variant="whatsapp" disabled={submitting} className="w-full">
                  {submitting ? 'Sending…' : 'Enquire on WhatsApp'}
                </Button>
                <Button
                  as="a"
                  variant="ghost"
                  href={businessInfo.bookingComUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Booking.com
                </Button>
              </div>
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
