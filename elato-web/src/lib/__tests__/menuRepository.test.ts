import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getCategories,
  getMenuItems,
  getSpecials,
  getMenuItemById,
  searchMenuItems,
} from '../menuRepository'

// menuRepository.ts is now backed by a real FastAPI backend (via apiClient's
// `fetch`), not the local `celebreContent.ts` mock data — so these tests
// mock `fetch` and assert on the DTO -> domain-model mapping (snake_case ->
// camelCase, sorting, price fallbacks) rather than comparing against local
// content arrays.

function jsonResponse(body: unknown, status = 200) {
  return { status, ok: status >= 200 && status < 300, json: async () => body } as Response
}

const categoryDtos = [
  { id: 'cat-coffee', name: 'Artisan Coffee', slug: 'artisan-coffee', description: 'Slow-brewed.', display_order: 1, is_active: true, image_url: null },
  { id: 'cat-ice-cream', name: 'Premium Ice Creams', slug: 'premium-ice-creams', description: null, display_order: 0, is_active: true, image_url: 'https://cdn.test/cat.webp' },
]

const menuItemDtos = [
  {
    id: 'item-cold-brew',
    category_id: 'cat-coffee',
    name: 'House Cold Brew',
    description: 'Steeped 18 hours.',
    price: 150,
    is_available: true,
    is_veg: true,
    delivery_available: true,
    display_order: 1,
    image_url: 'https://cdn.test/item.webp',
  },
  {
    id: 'item-belgian-choc',
    category_id: 'cat-ice-cream',
    name: 'Belgian Chocolate',
    description: null,
    price: null,
    is_available: true,
    is_veg: true,
    delivery_available: false,
    display_order: 0,
    image_url: null,
  },
]

const specialDtos = [
  { id: 'sp-tower', title: 'Celebration Sundae Tower', description: 'Built for the table.', price: 890, image_url: 'https://cdn.test/sp.webp' },
  { id: 'sp-duo', title: 'Anniversary Dessert Duo', description: null, price: null, image_url: null },
]

describe('menuRepository', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  describe('getCategories', () => {
    it('maps DTOs to the Category shape and sorts by display_order', async () => {
      vi.mocked(fetch).mockResolvedValue(jsonResponse(categoryDtos))
      const result = await getCategories()
      expect(result.map((c) => c.id)).toEqual(['cat-ice-cream', 'cat-coffee'])
      expect(result[0]).toEqual({
        id: 'cat-ice-cream',
        name: 'Premium Ice Creams',
        slug: 'premium-ice-creams',
        description: '', // null -> '' fallback
        sortOrder: 0,
        imageUrl: 'https://cdn.test/cat.webp',
      })
    })
  })

  describe('getMenuItems', () => {
    it('maps DTOs to the MenuItem shape, sorts by display_order, and defaults null price to 0', async () => {
      vi.mocked(fetch).mockResolvedValue(jsonResponse(menuItemDtos))
      const result = await getMenuItems()
      expect(result.map((i) => i.id)).toEqual(['item-belgian-choc', 'item-cold-brew'])
      expect(result[0]).toEqual({
        id: 'item-belgian-choc',
        categoryId: 'cat-ice-cream',
        name: 'Belgian Chocolate',
        description: '',
        price: 0,
        isVeg: true,
        deliveryAvailable: false,
        sortOrder: 0,
        imageUrl: null,
      })
    })

    it('propagates a rejection when the request fails', async () => {
      vi.mocked(fetch).mockResolvedValue(jsonResponse({ error: { code: 'server_error', message: 'oops' } }, 500))
      await expect(getMenuItems()).rejects.toMatchObject({ status: 500 })
    })
  })

  describe('getSpecials', () => {
    it('maps title -> name and defaults null price/description', async () => {
      vi.mocked(fetch).mockResolvedValue(jsonResponse(specialDtos))
      const result = await getSpecials()
      expect(result).toEqual([
        { id: 'sp-tower', name: 'Celebration Sundae Tower', description: 'Built for the table.', price: 890, imageUrl: 'https://cdn.test/sp.webp' },
        { id: 'sp-duo', name: 'Anniversary Dessert Duo', description: '', price: 0, imageUrl: null },
      ])
    })
  })

  describe('getMenuItemById', () => {
    it('fetches all menu items and resolves the matching one', async () => {
      vi.mocked(fetch).mockResolvedValue(jsonResponse(menuItemDtos))
      const result = await getMenuItemById('item-cold-brew')
      expect(result?.name).toBe('House Cold Brew')
    })

    it('resolves undefined for an unknown id', async () => {
      vi.mocked(fetch).mockResolvedValue(jsonResponse(menuItemDtos))
      const result = await getMenuItemById('does-not-exist')
      expect(result).toBeUndefined()
    })
  })

  describe('searchMenuItems', () => {
    it('resolves an empty array for an empty/whitespace query without calling fetch', async () => {
      expect(await searchMenuItems('')).toEqual([])
      expect(await searchMenuItems('   ')).toEqual([])
      expect(fetch).not.toHaveBeenCalled()
    })

    it('matches by item name, case-insensitively, fetching categories and items', async () => {
      vi.mocked(fetch).mockImplementation((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/categories')) return Promise.resolve(jsonResponse(categoryDtos))
        return Promise.resolve(jsonResponse(menuItemDtos))
      })
      const result = await searchMenuItems('belgian chocolate')
      expect(result.map((i) => i.id)).toEqual(['item-belgian-choc'])
    })

    it('matches by category name', async () => {
      vi.mocked(fetch).mockImplementation((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/categories')) return Promise.resolve(jsonResponse(categoryDtos))
        return Promise.resolve(jsonResponse(menuItemDtos))
      })
      const result = await searchMenuItems('artisan coffee')
      expect(result.map((i) => i.id)).toEqual(['item-cold-brew'])
    })

    it('resolves an empty array for a query with no matches', async () => {
      vi.mocked(fetch).mockImplementation((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/categories')) return Promise.resolve(jsonResponse(categoryDtos))
        return Promise.resolve(jsonResponse(menuItemDtos))
      })
      const result = await searchMenuItems('xyz-nonexistent-zzz')
      expect(result).toEqual([])
    })
  })
})
