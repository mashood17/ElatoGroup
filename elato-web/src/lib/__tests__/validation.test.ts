import { describe, it, expect } from 'vitest'
import {
  validateName,
  validatePhone,
  validateEmail,
  validateMessage,
  validateDateRange,
  validateGuests,
  validateFutureDate,
} from '../validation'

describe('validateName', () => {
  it('accepts a normal name', () => {
    expect(validateName('Ayesha Khan')).toBeUndefined()
  })

  it('accepts hyphenated names', () => {
    expect(validateName('Jean-Luc')).toBeUndefined()
  })

  it('accepts the 2-char lower boundary', () => {
    expect(validateName('Al')).toBeUndefined()
  })

  it('accepts the 60-char upper boundary', () => {
    expect(validateName('A'.repeat(60))).toBeUndefined()
  })

  it('rejects 1 character (below boundary)', () => {
    expect(validateName('A')).toBeDefined()
  })

  it('rejects 61 characters (above boundary)', () => {
    expect(validateName('A'.repeat(61))).toBeDefined()
  })

  it('rejects empty string', () => {
    expect(validateName('')).toBeDefined()
  })

  it('rejects whitespace-only string', () => {
    expect(validateName('   ')).toBeDefined()
  })

  it('rejects digits', () => {
    expect(validateName('Ayesha1')).toBeDefined()
  })

  it('rejects special characters', () => {
    expect(validateName('Ayesha@Khan')).toBeDefined()
  })

  it('trims surrounding whitespace before validating', () => {
    expect(validateName('  Ayesha  ')).toBeUndefined()
  })
})

describe('validatePhone', () => {
  it('accepts a valid +91 number', () => {
    expect(validatePhone('+919876543210')).toBeUndefined()
  })

  it('accepts a valid +971 number (8-digit local part)', () => {
    expect(validatePhone('+971501234567')).toBeUndefined()
  })

  it('accepts a valid +971 number (7-digit local part)', () => {
    expect(validatePhone('+97121234567')).toBeUndefined()
  })

  it('accepts +91 formatted with spaces/hyphens (stripped before test)', () => {
    expect(validatePhone('+91 98765-43210')).toBeUndefined()
  })

  it('rejects a +91 number starting with a digit below 6', () => {
    expect(validatePhone('+915876543210')).toBeDefined()
  })

  it('rejects a +91 number with too few digits', () => {
    expect(validatePhone('+9198765432')).toBeDefined()
  })

  it('rejects a +91 number with too many digits', () => {
    expect(validatePhone('+9198765432100')).toBeDefined()
  })

  it('rejects a +971 number starting with 0 or 1 (outside 2-9 range)', () => {
    expect(validatePhone('+971101234567')).toBeDefined()
  })

  it('rejects a number with no country code', () => {
    expect(validatePhone('9876543210')).toBeDefined()
  })

  it('rejects an unsupported country code', () => {
    expect(validatePhone('+14155551234')).toBeDefined()
  })

  it('rejects empty string', () => {
    expect(validatePhone('')).toBeDefined()
  })
})

describe('validateEmail', () => {
  it('accepts a normal email', () => {
    expect(validateEmail('user@example.com')).toBeUndefined()
  })

  it('accepts a subdomain email', () => {
    expect(validateEmail('user@mail.example.co.in')).toBeUndefined()
  })

  it('rejects an email missing "@"', () => {
    expect(validateEmail('userexample.com')).toBeDefined()
  })

  it('rejects an email missing a domain dot', () => {
    expect(validateEmail('user@example')).toBeDefined()
  })

  it('rejects an email with a space', () => {
    expect(validateEmail('user name@example.com')).toBeDefined()
  })

  it('rejects empty string', () => {
    expect(validateEmail('')).toBeDefined()
  })
})

describe('validateMessage', () => {
  it('accepts an empty message', () => {
    expect(validateMessage('')).toBeUndefined()
  })

  it('accepts a message at the default 500-char boundary', () => {
    expect(validateMessage('a'.repeat(500))).toBeUndefined()
  })

  it('rejects a message one over the default boundary', () => {
    expect(validateMessage('a'.repeat(501))).toBeDefined()
  })

  it('respects a custom max length', () => {
    expect(validateMessage('a'.repeat(11), 10)).toBeDefined()
    expect(validateMessage('a'.repeat(10), 10)).toBeUndefined()
  })
})

describe('validateDateRange', () => {
  const today = new Date()
  // Local-date formatting on purpose: `toISOString()` is UTC and can land on
  // the wrong calendar day relative to the local "today" the source module
  // computes (`new Date(new Date().toDateString())`), depending on timezone
  // and time of day (e.g. IST is UTC+5:30, so shortly after local midnight,
  // the UTC date is still "yesterday").
  const toISODate = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  const todayStr = toISODate(today)
  const tomorrowStr = toISODate(new Date(today.getTime() + 24 * 60 * 60 * 1000))
  const yesterdayStr = toISODate(new Date(today.getTime() - 24 * 60 * 60 * 1000))
  const dayAfterTomorrowStr = toISODate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000))

  it('accepts today as check-in and a later check-out', () => {
    const errors = validateDateRange(todayStr, tomorrowStr)
    expect(errors.checkIn).toBeUndefined()
    expect(errors.checkOut).toBeUndefined()
  })

  it('flags a missing check-in', () => {
    const errors = validateDateRange('', tomorrowStr)
    expect(errors.checkIn).toBeDefined()
  })

  it('flags a missing check-out', () => {
    const errors = validateDateRange(todayStr, '')
    expect(errors.checkOut).toBeDefined()
  })

  it('flags a check-in in the past', () => {
    const errors = validateDateRange(yesterdayStr, tomorrowStr)
    expect(errors.checkIn).toBeDefined()
  })

  it('flags a check-out on the same day as check-in', () => {
    const errors = validateDateRange(todayStr, todayStr)
    expect(errors.checkOut).toBeDefined()
  })

  it('flags a check-out before check-in', () => {
    const errors = validateDateRange(tomorrowStr, todayStr)
    expect(errors.checkOut).toBeDefined()
  })

  it('accepts a check-out the day after check-in', () => {
    const errors = validateDateRange(tomorrowStr, dayAfterTomorrowStr)
    expect(errors.checkOut).toBeUndefined()
  })
})

describe('validateGuests', () => {
  it('accepts a value within range', () => {
    expect(validateGuests(4, 1, 8)).toBeUndefined()
  })

  it('accepts the lower boundary', () => {
    expect(validateGuests(1, 1, 8)).toBeUndefined()
  })

  it('accepts the upper boundary', () => {
    expect(validateGuests(8, 1, 8)).toBeUndefined()
  })

  it('rejects one below the lower boundary', () => {
    expect(validateGuests(0, 1, 8)).toBeDefined()
  })

  it('rejects one above the upper boundary', () => {
    expect(validateGuests(9, 1, 8)).toBeDefined()
  })

  it('rejects a non-integer', () => {
    expect(validateGuests(2.5, 1, 8)).toBeDefined()
  })

  it('rejects NaN', () => {
    expect(validateGuests(NaN, 1, 8)).toBeDefined()
  })
})

describe('validateFutureDate', () => {
  const today = new Date()
  // Local-date formatting on purpose: `toISOString()` is UTC and can land on
  // the wrong calendar day relative to the local "today" the source module
  // computes (`new Date(new Date().toDateString())`), depending on timezone
  // and time of day (e.g. IST is UTC+5:30, so shortly after local midnight,
  // the UTC date is still "yesterday").
  const toISODate = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  const todayStr = toISODate(today)
  const tomorrowStr = toISODate(new Date(today.getTime() + 24 * 60 * 60 * 1000))
  const yesterdayStr = toISODate(new Date(today.getTime() - 24 * 60 * 60 * 1000))

  it('accepts today', () => {
    expect(validateFutureDate(todayStr)).toBeUndefined()
  })

  it('accepts a future date', () => {
    expect(validateFutureDate(tomorrowStr)).toBeUndefined()
  })

  it('rejects a past date', () => {
    expect(validateFutureDate(yesterdayStr)).toBeDefined()
  })

  it('rejects an empty string', () => {
    expect(validateFutureDate('')).toBeDefined()
  })
})
