// PRD Ch. 30 field validation rules, shared across every public form.

export const NAME_RE = /^[A-Za-z\s-]{2,60}$/
// E.164-normalized, validated against India (+91) and UAE (+971) patterns.
export const PHONE_RE = /^(\+91[6-9]\d{9}|\+971[2-9]\d{7,8})$/
// RFC 5322-lite — sufficient for client-side sanity checking, not exhaustive.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateName(name: string): string | undefined {
  return NAME_RE.test(name.trim())
    ? undefined
    : 'Enter 2–60 letters, spaces or hyphens only.'
}

export function validatePhone(phone: string): string | undefined {
  return PHONE_RE.test(phone.trim().replace(/[\s-]/g, ''))
    ? undefined
    : 'Enter a valid +91 or +971 number, e.g. +91 98765 43210.'
}

// 10-digit Indian mobile number, no country code — used by forms that
// intentionally omit the +91 prefix (e.g. the homepage Visit enquiry).
export const PHONE_10_RE = /^[6-9]\d{9}$/

export function validatePhone10(phone: string): string | undefined {
  return PHONE_10_RE.test(phone.trim().replace(/[\s-]/g, ''))
    ? undefined
    : 'Enter a valid 10-digit mobile number.'
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
