import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, CalendarDays, Users, MessageSquare, MessageCircle, type LucideIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import sectionBackground from '../../assets/newbg/bg.webp'
import sectionBackgroundMobile from '../../assets/newbg/bg-mb.webp'
import { SectionBackground } from '../ui/SectionBackground'
import { SiteImage } from '../ui/SiteImage'
import { businessInfo } from '../../content/siteContent'
import { STAY_GUEST_MIN, STAY_GUEST_MAX } from '../../content/stayContent'
import { buildWhatsAppLink } from '../../lib/whatsapp'
import { sectionReveal, viewportOnce } from '../../lib/motion'
import {
  validateName,
  validatePhone10,
  validateEmail,
  validateMessage,
  validateDateRange,
  validateGuests,
} from '../../lib/validation'
import { persistEnquiry } from '../../lib/enquiryRepository'
import { trackEvent } from '../../lib/analytics'
import { useSiteImage } from '../../lib/useSiteImage'

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
  const reserveImage = useSiteImage('stay_reserve_image', '')

  const validate = (): Errors => {
    const dateErrors = validateDateRange(checkIn, checkOut)
    return {
      name: validateName(name),
      phone: validatePhone10(phone),
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
    setTimeout(() => {
      const waMessage =
        `Hi Elato! My name is ${name.trim()}. I'd like to check availability for ` +
        `${checkIn} to ${checkOut}, ${guests} guest${guests > 1 ? 's' : ''}. ${message.trim()}`.trim()
      persistEnquiry({
        source_page: 'stay',
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        message: `Check-out: ${checkOut}. ${message.trim()}`.trim(),
        guests,
        preferred_date: checkIn || undefined,
      })
      trackEvent('enquiry_submitted', 'stay', { guests })
      window.open(buildWhatsAppLink(businessInfo.whatsappNumber, waMessage), '_blank', 'noreferrer')
      trackEvent('whatsapp_click', 'stay', { guests })
      setSubmitting(false)
      setSubmitted(true)
    }, 400)
  }

  return (
    <motion.section id="booking" className="relative overflow-hidden py-16 lg:py-32">
      <SectionBackground image={sectionBackground} mobileImage={sectionBackgroundMobile} />
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={sectionReveal}
        className="container-elato relative mx-auto max-w-6xl"
      >
        <div className="mb-10 text-center">
          <p className="text-caption text-secondary-500">Reserve Your Stay</p>
          <h2 className="text-h2 mt-2 font-sans font-bold text-[#9e7641]">Begin Your Stay with ELATŌ</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-stretch lg:gap-10">
          <div className="relative hidden lg:block">
            <div
              className="absolute -inset-3 rounded-[44px] rounded-bl-[130px] bg-primary-50/80"
              aria-hidden="true"
            />
            <div className="relative h-full w-full overflow-hidden rounded-[36px] rounded-bl-[110px] border-[10px] border-secondary-900 ring-4 ring-surface-elevated shadow-elato-lg lg:rounded-[48px] lg:rounded-bl-[150px] lg:border-[14px]">
              <SiteImage
                src={reserveImage}
                alt="ELATŌ Stay — the premium 2BHK apartment"
                className="h-full w-full object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-secondary-900/90 via-secondary-900/25 to-transparent"
                aria-hidden="true"
              />
              <div className="absolute inset-x-0 bottom-16 p-8">
                <p className="text-caption font-bold text-primary-100/80">ELATŌ Stay</p>
                <p className="text-h3 mt-2 font-sans font-normal text-[#e7caa0]">
                  A home away from home, in the heart of Panemangalore
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-[44px] bg-primary-50/80" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[36px] border-[10px] border-secondary-900 ring-4 ring-surface-elevated bg-surface-elevated/95 p-6 shadow-elato-lg backdrop-blur-sm lg:rounded-[48px] lg:border-[14px] lg:p-10">
            {submitted ? (
              <p className="text-body text-success" role="status">
                Thank you — your enquiry has been sent, and WhatsApp should have opened with the details pre-filled.
              </p>
            ) : (
              <>
                <div className="mb-6 border-b border-[#9e7641]/15 pb-5">
                  <p className="text-caption text-[#9e7641]">Enquiry Form</p>
                  <p className="text-body mt-1 text-neutral-warm-500">
                    Share a few details and we'll confirm availability on WhatsApp.
                  </p>
                </div>

                <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Field
                      id="booking-name"
                      label="Name"
                      type="text"
                      icon={User}
                      value={name}
                      onChange={setName}
                      onBlur={() => setErrors((prev) => ({ ...prev, name: validate().name }))}
                      error={errors.name}
                    />
                    <Field
                      id="booking-phone"
                      label="Phone"
                      type="tel"
                      icon={Phone}
                      value={phone}
                      onChange={setPhone}
                      onBlur={() => setErrors((prev) => ({ ...prev, phone: validate().phone }))}
                      error={errors.phone}
                      placeholder="98765 43210"
                    />
                  </div>

                  <Field
                    id="booking-email"
                    label="Email"
                    type="email"
                    icon={Mail}
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
                      icon={CalendarDays}
                      value={checkIn}
                      onChange={setCheckIn}
                      onBlur={() => setErrors((prev) => ({ ...prev, checkIn: validate().checkIn }))}
                      error={errors.checkIn}
                    />
                    <Field
                      id="booking-checkout"
                      label="Check-out"
                      type="date"
                      icon={CalendarDays}
                      value={checkOut}
                      onChange={setCheckOut}
                      onBlur={() => setErrors((prev) => ({ ...prev, checkOut: validate().checkOut }))}
                      error={errors.checkOut}
                    />
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="booking-guests" className="text-caption text-neutral-warm-500">
                        Guests
                      </label>
                      <div className="relative">
                        <Users
                          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9e7641]/60"
                          aria-hidden="true"
                        />
                        <input
                          id="booking-guests"
                          type="number"
                          min={STAY_GUEST_MIN}
                          max={STAY_GUEST_MAX}
                          value={guests}
                          onChange={(e) => setGuests(Number(e.target.value))}
                          onBlur={() => setErrors((prev) => ({ ...prev, guests: validate().guests }))}
                          aria-describedby={errors.guests ? 'booking-guests-error' : undefined}
                          className="h-12 w-full rounded-xl border border-[#9e7641]/25 bg-surface-base/60 pl-10 pr-4 text-body transition-colors focus-visible:border-[#9e7641] focus-visible:bg-surface-base"
                        />
                      </div>
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
                    <div className="relative">
                      <MessageSquare
                        className="pointer-events-none absolute left-3.5 top-4 h-4 w-4 text-[#9e7641]/60"
                        aria-hidden="true"
                      />
                      <textarea
                        id="booking-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onBlur={() => setErrors((prev) => ({ ...prev, message: validate().message }))}
                        rows={4}
                        maxLength={500}
                        aria-describedby={errors.message ? 'booking-message-error' : undefined}
                        className="w-full rounded-xl border border-[#9e7641]/25 bg-surface-base/60 py-3 pl-10 pr-4 text-body transition-colors focus-visible:border-[#9e7641] focus-visible:bg-surface-base"
                      />
                    </div>
                    {errors.message && (
                      <p id="booking-message-error" className="text-caption text-danger" aria-live="polite">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <div className="mt-2 flex flex-col items-center gap-3">
                    <Button
                      type="submit"
                      variant="whatsapp"
                      icon={<MessageCircle className="h-4 w-4" />}
                      disabled={submitting}
                      className="w-full !bg-[#9e7641] !rounded-xl tracking-wide hover:!bg-[#8a6636]"
                    >
                      {submitting ? 'Sending…' : 'Enquire on WhatsApp'}
                    </Button>
                    <Button
                      as="a"
                      variant="ghost"
                      href={businessInfo.bookingComUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackEvent('booking_click', 'stay')}
                      className="!text-[#9e7641]"
                    >
                      View on Booking.com
                    </Button>
                  </div>
                </form>
              </>
            )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  )
}

function Field({
  id,
  label,
  type,
  icon: Icon,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
}: {
  id: string
  label: string
  type: string
  icon?: LucideIcon
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
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9e7641]/60"
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-12 w-full rounded-xl border border-[#9e7641]/25 bg-surface-base/60 pr-4 text-body transition-colors focus-visible:border-[#9e7641] focus-visible:bg-surface-base ${Icon ? 'pl-10' : 'pl-4'}`}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="text-caption text-danger" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  )
}
