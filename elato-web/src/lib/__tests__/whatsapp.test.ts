import { describe, it, expect } from 'vitest'
import { buildWhatsAppLink } from '../whatsapp'

describe('buildWhatsAppLink', () => {
  it('builds a wa.me link with the phone digits in the path', () => {
    const link = buildWhatsAppLink('919731400313', 'Hello')
    expect(link.startsWith('https://wa.me/919731400313?text=')).toBe(true)
  })

  it('URL-encodes spaces and punctuation in the message', () => {
    const link = buildWhatsAppLink('919731400313', 'Hi Elato! My name is Ayesha.')
    const url = new URL(link)
    expect(url.searchParams.get('text')).toBe('Hi Elato! My name is Ayesha.')
    // Raw query string must be percent-encoded, not contain literal spaces.
    expect(link).toContain(encodeURIComponent('Hi Elato! My name is Ayesha.'))
    expect(link).not.toMatch(/text=Hi Elato/)
  })

  it('encodes special/reserved URL characters (&, =, #, +, emoji)', () => {
    const message = 'Order: 2x Sundae & 1x Shake = ₹500 #treat 😊'
    const link = buildWhatsAppLink('919731400313', message)
    const url = new URL(link)
    expect(url.searchParams.get('text')).toBe(message)
    expect(link).not.toContain('&1x') // raw "&" would break query-param parsing
  })

  it('round-trips via decodeURIComponent back to the original message', () => {
    const message = 'Hi! I would like to order: 1x Belgian Chocolate (₹180 each). Total: ₹180.'
    const link = buildWhatsAppLink('919731400313', message)
    const encoded = link.split('?text=')[1]
    expect(decodeURIComponent(encoded)).toBe(message)
  })

  it('produces an empty text param for an empty message', () => {
    const link = buildWhatsAppLink('919731400313', '')
    expect(link).toBe('https://wa.me/919731400313?text=')
  })
})
