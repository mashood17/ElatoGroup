/**
 * Simulated data-access layer, shaped exactly like the Supabase queries this
 * will become (PRD Ch. 34 `/api/v1/categories`, `/menu-items`, `/specials`).
 * Every consumer calls these functions, never `celebreContent.ts` directly —
 * swapping in `@supabase/supabase-js` later means rewriting only this file.
 */
import { categories, menuItems, specials, type Category, type MenuItem, type Special } from '../content/celebreContent'
import { simulateFetch } from './simulateFetch'

export async function getCategories(): Promise<Category[]> {
  return simulateFetch([...categories].sort((a, b) => a.sortOrder - b.sortOrder))
}

export async function getMenuItems(): Promise<MenuItem[]> {
  return simulateFetch([...menuItems].sort((a, b) => a.sortOrder - b.sortOrder))
}

export async function getSpecials(): Promise<Special[]> {
  return simulateFetch([...specials])
}

export async function getMenuItemById(id: string): Promise<MenuItem | undefined> {
  return simulateFetch(menuItems.find((item) => item.id === id))
}

export async function searchMenuItems(query: string): Promise<MenuItem[]> {
  const q = query.trim().toLowerCase()
  if (!q) return simulateFetch([])

  const categoryNameById = new Map(categories.map((c) => [c.id, c.name.toLowerCase()]))
  const results = menuItems.filter((item) => {
    const categoryName = categoryNameById.get(item.categoryId) ?? ''
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      categoryName.includes(q)
    )
  })
  return simulateFetch(results, 250)
}
