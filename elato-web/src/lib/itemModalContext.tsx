import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

type ItemModalContextValue = {
  openItemId: string | null
  openItem: (id: string) => void
  closeItem: () => void
  /** The menu item row currently pulsing after a "View Menu" jump, or null. */
  highlightItemId: string | null
  /** Flags a row as highlighted for a couple seconds, then clears itself. */
  highlightItem: (id: string) => void
  /** Bumped whenever something outside the Menu section needs its search filter cleared. */
  menuSearchResetToken: number
  resetMenuSearch: () => void
}

const ItemModalContext = createContext<ItemModalContextValue | undefined>(undefined)

/**
 * Shared across the Célébré page so a menu item's detail modal can be opened
 * from more than one place (the menu list itself, and Featured Specials'
 * "View Menu" action) without threading callbacks through every ancestor.
 * Also carries the transient highlight used to point out a specific row
 * after scrolling to it.
 */
export function ItemModalProvider({ children }: { children: ReactNode }) {
  const [openItemId, setOpenItemId] = useState<string | null>(null)
  const [highlightItemId, setHighlightItemId] = useState<string | null>(null)
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [menuSearchResetToken, setMenuSearchResetToken] = useState(0)

  const closeItem = useCallback(() => setOpenItemId(null), [])

  const highlightItem = useCallback((id: string) => {
    if (highlightTimer.current) clearTimeout(highlightTimer.current)
    setHighlightItemId(id)
    highlightTimer.current = setTimeout(() => setHighlightItemId(null), 1800)
  }, [])

  const resetMenuSearch = useCallback(() => setMenuSearchResetToken((t) => t + 1), [])

  // Stable value reference — previously a fresh object literal every
  // render, which re-rendered every consumer (the whole Célébré menu tree)
  // whenever any field here changed, not just the one it actually reads.
  const value = useMemo<ItemModalContextValue>(
    () => ({
      openItemId,
      openItem: setOpenItemId,
      closeItem,
      highlightItemId,
      highlightItem,
      menuSearchResetToken,
      resetMenuSearch,
    }),
    [openItemId, closeItem, highlightItemId, highlightItem, menuSearchResetToken, resetMenuSearch],
  )

  return <ItemModalContext.Provider value={value}>{children}</ItemModalContext.Provider>
}

export function useItemModal() {
  const ctx = useContext(ItemModalContext)
  if (!ctx) throw new Error('useItemModal must be used within an ItemModalProvider')
  return ctx
}
