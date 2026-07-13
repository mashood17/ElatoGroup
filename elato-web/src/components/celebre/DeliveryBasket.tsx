import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { useBasket } from '../../lib/basketContext'
import { businessInfo } from '../../content/siteContent'
import { buildWhatsAppLink } from '../../lib/whatsapp'
import { validateName, validateMessage } from '../../lib/validation'

const MAX_ITEM_LINES = 8

function buildOrderMessage(
  name: string,
  items: { name: string; price: number; quantity: number }[],
  subtotal: number,
  note: string,
): string {
  const lines = items.slice(0, MAX_ITEM_LINES).map((i) => `${i.quantity}x ${i.name} (₹${i.price} each)`)
  const overflow = items.length - MAX_ITEM_LINES
  const itemsText =
    overflow > 0
      ? `${lines.join(', ')}, +${overflow} more items — full list attached on request`
      : lines.join(', ')

  const noteText = note.trim() ? ` Note: ${note.trim()}.` : ''
  return `Hi Elato! My name is ${name.trim()}. I would like to order: ${itemsText}. Total: ₹${subtotal}.${noteText}`
}

export function DeliveryBasket() {
  const { items, itemCount, subtotal, incrementItem, decrementItem, removeItem, clear } = useBasket()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<{ name?: string; note?: string }>({})

  if (itemCount === 0 && !open) return null

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const nameError = validateName(name)
    const noteError = validateMessage(note)
    setErrors({ name: nameError, note: noteError })
    if (nameError || noteError) return

    const message = buildOrderMessage(name, items, subtotal, note)
    window.open(buildWhatsAppLink(businessInfo.whatsappNumber, message), '_blank', 'noreferrer')
    clear()
    setName('')
    setNote('')
    setOpen(false)
  }

  return (
    <>
      {!open && itemCount > 0 && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex h-14 items-center gap-2 rounded-full bg-secondary-500 px-6 text-body font-semibold text-white shadow-elato-lg lg:bottom-6 lg:right-6"
        >
          View Order ({itemCount})
        </button>
      )}

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-secondary-900/40 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: '100%', x: 0, opacity: 0 }}
              animate={{ y: 0, x: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-lg bg-surface-elevated p-6 shadow-elato-xl lg:inset-x-auto lg:right-6 lg:top-24 lg:bottom-6 lg:w-96 lg:rounded-lg"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-h3 text-secondary-900">Your Order</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-body text-neutral-warm-500 hover:text-secondary-500"
                  aria-label="Close order summary"
                >
                  ✕
                </button>
              </div>

              {items.length === 0 ? (
                <p className="text-body mt-6 text-neutral-warm-500">Your order is empty.</p>
              ) : (
                <>
                  <ul className="mt-4 flex flex-col gap-4">
                    {items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-body text-secondary-900">{item.name}</p>
                          <p className="text-caption text-neutral-warm-500">₹{item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => decrementItem(item.id)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-100 text-secondary-500"
                          >
                            −
                          </button>
                          <span className="text-body w-4 text-center text-secondary-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => incrementItem(item.id)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-100 text-secondary-500"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.name}`}
                            className="ml-1 text-caption text-danger"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center justify-between border-t border-primary-100 pt-4">
                    <span className="text-body font-semibold text-secondary-900">Subtotal</span>
                    <span className="text-body font-semibold text-secondary-900">₹{subtotal}</span>
                  </div>

                  <form className="mt-4 flex flex-col gap-3" onSubmit={onSubmit} noValidate>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="basket-name" className="text-caption text-neutral-warm-500">
                        Your Name
                      </label>
                      <input
                        id="basket-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        aria-describedby={errors.name ? 'basket-name-error' : undefined}
                        className="h-11 rounded-md border border-primary-100 px-3 text-body focus-visible:border-secondary-500"
                      />
                      {errors.name && (
                        <p id="basket-name-error" className="text-caption text-danger" aria-live="polite">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="basket-note" className="text-caption text-neutral-warm-500">
                        Notes (optional)
                      </label>
                      <textarea
                        id="basket-note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        maxLength={500}
                        aria-describedby={errors.note ? 'basket-note-error' : undefined}
                        className="rounded-md border border-primary-100 px-3 py-2 text-body focus-visible:border-secondary-500"
                      />
                      {errors.note && (
                        <p id="basket-note-error" className="text-caption text-danger" aria-live="polite">
                          {errors.note}
                        </p>
                      )}
                    </div>

                    <Button type="submit" variant="whatsapp" className="mt-2 w-full">
                      Order on WhatsApp
                    </Button>
                  </form>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
