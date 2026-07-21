// PRD Ch. 30 field validation rules, shared across every public form.

export const NAME_RE = /^[A-Za-z\s-]{2,60}$/
// RFC 5322-lite — sufficient for client-side sanity checking, not exhaustive.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateName(name: string): string | undefined {
  return NAME_RE.test(name.trim())
    ? undefined
    : 'Enter 2–60 letters, spaces or hyphens only.'
}

// Every phone field pairs a country-code dropdown (see lib/countryCodes.ts)
// with a national-number input — validated per selected country, mirrored
// server-side in app/core/phone.py. India and UAE keep the specific digit
// patterns the app has always enforced for its two established markets;
// every other dial code (the dropdown offers many) gets a generic
// length/shape check rather than a bespoke rule per country.
const _STRICT_COUNTRY_RULES: Record<string, RegExp> = {
  '+91': /^[6-9]\d{9}$/,
  '+971': /^[2-9]\d{7,8}$/,
}
const _GENERIC_NATIONAL_NUMBER_RE = /^\d{6,14}$/

export function validatePhoneForCountry(dialCode: string, nationalNumber: string): string | undefined {
  const cleaned = nationalNumber.trim().replace(/[\s-]/g, '')
  const rule = _STRICT_COUNTRY_RULES[dialCode]
  if (rule) {
    return rule.test(cleaned) ? undefined : `Enter a valid ${dialCode} number, e.g. ${dialCode === '+91' ? '98765 43210' : '50 123 4567'}.`
  }
  return _GENERIC_NATIONAL_NUMBER_RE.test(cleaned) ? undefined : 'Enter a valid phone number.'
}

/** Assembles the E.164 string the backend expects from a validated dial code + national number pair. */
export function toE164(dialCode: string, nationalNumber: string): string {
  return `${dialCode}${nationalNumber.trim().replace(/[\s-]/g, '')}`
}

export function validateEmail(email: string): string | undefined {
  return EMAIL_RE.test(email.trim()) ? undefined : 'Enter a valid email address.'
}

export function validateMessage(message: string, max = 500): string | undefined {
  return message.length > max ? `Message must be ${max} characters or fewer.` : undefined
}

/** Both dates present/future, check-out after check-in (PRD Ch. 30). */
export function validateDateRange(
  checkIn: string,
  checkOut: string,
): { checkIn?: string; checkOut?: string } {
  const errors: { checkIn?: string; checkOut?: string } = {}
  const today = new Date(new Date().toDateString())

  if (!checkIn) {
    errors.checkIn = 'Select a check-in date.'
  } else if (new Date(checkIn) < today) {
    errors.checkIn = 'Check-in must be today or later.'
  }

  if (!checkOut) {
    errors.checkOut = 'Select a check-out date.'
  } else if (checkIn && new Date(checkOut) <= new Date(checkIn)) {
    errors.checkOut = 'Check-out must be after check-in.'
  }

  return errors
}

/** Integer guest count within an inclusive range. */
export function validateGuests(guests: number, min: number, max: number): string | undefined {
  return Number.isInteger(guests) && guests >= min && guests <= max
    ? undefined
    : `Enter a guest count between ${min} and ${max}.`
}

/** A single required present/future date (PRD Ch. 30) — e.g. an events enquiry's preferred date. */
export function validateFutureDate(date: string): string | undefined {
  if (!date) return 'Select a date.'
  const today = new Date(new Date().toDateString())
  return new Date(date) < today ? 'Date must be today or later.' : undefined
}
