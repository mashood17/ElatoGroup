import { test, expect } from '@playwright/test'
import { mockCelebreApi, mockAnalyticsApi } from './fixtures/api-mocks'

/**
 * Celebré WhatsApp order flow: add an item to the basket from the menu,
 * fill the checkout form, and confirm a correctly-composed wa.me deep link
 * opens.
 *
 * The menu/specials data now comes from a real FastAPI backend
 * (src/lib/menuRepository.ts), which has no live Supabase data seeded yet —
 * so the categories/menu-items/specials calls are mocked at the network
 * layer (see fixtures/api-mocks.ts) to keep this deterministic and
 * independent of backend/DB state. The WhatsApp checkout itself is still
 * frontend-only (window.open with a client-built message).
 */
test.describe('Celebré WhatsApp order flow', () => {
  test('adds an item to the basket and generates a correct WhatsApp order link', async ({
    page,
    context,
  }) => {
    await mockCelebreApi(page)
    await mockAnalyticsApi(page)
    await page.goto('/elato-celebre')

    // Open the item detail modal for a known menu item.
    const itemButton = page.getByRole('button', { name: /Belgian Chocolate/i }).first()
    await itemButton.scrollIntoViewIfNeeded()
    await itemButton.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Belgian Chocolate' })).toBeVisible()

    await dialog.getByRole('button', { name: 'Add to Delivery Order' }).click()
    await expect(dialog.getByRole('button', { name: 'Added to Order' })).toBeVisible()

    // Close the modal, then open the floating basket.
    await dialog.getByRole('button', { name: 'Close' }).click()
    await expect(dialog).not.toBeVisible()

    await page.getByRole('button', { name: /View Order \(1\)/ }).click()
    await expect(page.getByRole('heading', { name: 'Your Order' })).toBeVisible()
    // Scoped to the basket's <li> — the menu row behind it also renders the
    // item name, so an unscoped text locator would match both.
    await expect(page.getByRole('listitem').filter({ hasText: 'Belgian Chocolate' })).toBeVisible()

    await page.getByLabel('Your Name').fill('Ayesha Khan')

    // Submitting opens wa.me in a new tab (`window.open(..., '_blank')`).
    // wa.me is a real, internet-reachable link that redirects to
    // api.whatsapp.com — racing that redirect (waiting for the popup then
    // checking its URL) is flaky, since the redirect can complete before we
    // ever get to look. Intercepting the wa.me request itself and never
    // letting it actually navigate is deterministic instead: we capture the
    // exact URL this app generated, regardless of network conditions.
    let capturedWaUrl: string | null = null
    await context.route('https://wa.me/**', async (route) => {
      capturedWaUrl = route.request().url()
      await route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>ok</body></html>' })
    })

    await page.getByRole('button', { name: 'Order on WhatsApp' }).click()
    await expect.poll(() => capturedWaUrl).not.toBeNull()

    const waUrl = new URL(capturedWaUrl!)
    expect(waUrl.hostname).toBe('wa.me')
    expect(waUrl.pathname).toBe('/919731400313')

    const text = waUrl.searchParams.get('text') ?? ''
    expect(text).toContain('Ayesha Khan')
    expect(text).toContain('Belgian Chocolate')
    expect(text).toContain('₹180')
    expect(text).toMatch(/Total: ₹180/)

    // Basket clears and closes after a successful submit.
    await expect(page.getByRole('button', { name: /View Order/ })).not.toBeVisible()
  })
})
