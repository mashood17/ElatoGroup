import { useState } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ItemDetailModal } from '../ItemDetailModal'
import { BasketProvider } from '../../../../lib/basketContext'
import { categories } from '../../../../content/celebreContent'

// ItemDetailModal loads its item via menuRepository's `getMenuItemById`,
// which — since the "Backend Structure" commit — fetches from a real
// FastAPI backend (GET /api/v1/menu-items) instead of local mock content.
// The category *name* lookup, though, still reads the local
// `celebreContent.ts` `categories` array directly (unchanged by that
// commit) — so `knownItem.categoryId` below must match a real local
// category id for the category name assertion to make sense.
const knownItem = {
  id: 'item-belgian-choc',
  categoryId: categories[0].id,
  name: 'Belgian Chocolate',
  description: 'Belgian dark chocolate, churned in-house.',
  price: 180,
  isVeg: true,
  deliveryAvailable: true,
  sortOrder: 0,
}

function knownItemDto() {
  return {
    id: knownItem.id,
    category_id: knownItem.categoryId,
    name: knownItem.name,
    description: knownItem.description,
    price: knownItem.price,
    is_available: true,
    is_veg: knownItem.isVeg,
    delivery_available: knownItem.deliveryAvailable,
    display_order: knownItem.sortOrder,
  }
}

function jsonResponse(body: unknown, status = 200) {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response
}

function renderModal(itemId: string | null, onClose: () => void) {
  return render(
    <BasketProvider>
      <button type="button">Outside trigger</button>
      <ItemDetailModal itemId={itemId} onClose={onClose} />
    </BasketProvider>,
  )
}

describe('ItemDetailModal', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.useRealTimers()
    globalThis.fetch = vi.fn().mockResolvedValue(jsonResponse([knownItemDto()]))
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('renders nothing when itemId is null', () => {
    const onClose = vi.fn()
    renderModal(null, onClose)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('loads and displays the item once itemId is set', async () => {
    const onClose = vi.fn()
    renderModal(knownItem.id, onClose)

    expect(screen.getByText('Loading…')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: knownItem.name })).toBeInTheDocument()
    })
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('calls onClose when the "Close" button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal(knownItem.id, onClose)

    await waitFor(() => screen.getByRole('heading', { name: knownItem.name }))
    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal(knownItem.id, onClose)

    await waitFor(() => screen.getByRole('heading', { name: knownItem.name }))

    const dialog = screen.getByRole('dialog')
    // The backdrop is the dialog's parent motion.div (has the onClose click handler).
    const backdrop = dialog.parentElement
    expect(backdrop).not.toBeNull()
    await user.click(backdrop as HTMLElement)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does NOT call onClose when clicking inside the dialog content (click stops propagation)', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal(knownItem.id, onClose)

    await waitFor(() => screen.getByRole('heading', { name: knownItem.name }))
    await user.click(screen.getByRole('heading', { name: knownItem.name }))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal(knownItem.id, onClose)

    await waitFor(() => screen.getByRole('heading', { name: knownItem.name }))
    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('focuses the dialog when opened and restores focus to the trigger element on close', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [itemId, setItemId] = useState<string | null>(null)
      return (
        <BasketProvider>
          <button type="button" onClick={() => setItemId(knownItem.id)}>
            Open modal
          </button>
          <ItemDetailModal itemId={itemId} onClose={() => setItemId(null)} />
        </BasketProvider>
      )
    }

    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Open modal' })
    trigger.focus()
    expect(trigger).toHaveFocus()

    await user.click(trigger)
    await waitFor(() => screen.getByRole('dialog'))
    expect(screen.getByRole('dialog')).toHaveFocus()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it('traps Tab focus within the dialog (wraps from last to first focusable element)', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal(knownItem.id, onClose)

    await waitFor(() => screen.getByRole('heading', { name: knownItem.name }))

    const addButton = screen.getByRole('button', { name: /Add to Delivery Order/i })
    const closeButton = screen.getByRole('button', { name: 'Close' })

    closeButton.focus()
    expect(closeButton).toHaveFocus()

    // Tab from the last focusable element should wrap to the first.
    await user.tab()
    expect(addButton).toHaveFocus()
  })
})
