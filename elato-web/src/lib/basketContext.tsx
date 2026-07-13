import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type BasketItem = {
  id: string
  name: string
  price: number
  quantity: number
}

type BasketContextValue = {
  items: BasketItem[]
  itemCount: number
  subtotal: number
  addItem: (item: { id: string; name: string; price: number }, quantity?: number) => void
  removeItem: (id: string) => void
  incrementItem: (id: string) => void
  decrementItem: (id: string) => void
  clear: () => void
}

const BasketContext = createContext<BasketContextValue | undefined>(undefined)

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([])

  const addItem = (item: { id: string; name: string; price: number }, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i))
      }
      return [...prev, { ...item, quantity }]
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const incrementItem = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)))
  }

  const decrementItem = (id: string) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0),
    )
  }

  const clear = () => setItems([])

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.quantity * i.price, 0), [items])

  return (
    <BasketContext.Provider
      value={{ items, itemCount, subtotal, addItem, removeItem, incrementItem, decrementItem, clear }}
    >
      {children}
    </BasketContext.Provider>
  )
}

export function useBasket() {
  const ctx = useContext(BasketContext)
  if (!ctx) throw new Error('useBasket must be used within a BasketProvider')
  return ctx
}
