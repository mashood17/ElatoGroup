/**
 * Real data-access layer backed by the FastAPI API (`/api/v1/categories`,
 * `/menu-items`, `/specials`). Every consumer calls these functions, never
 * `celebreContent.ts` directly — this is the only file that changed when
 * the mock repository (PRD Ch. 34) became a real one.
 */
import { apiGet } from './apiClient'
import type { Category, MenuItem, Special } from '../content/celebreContent'

type CategoryDto = {
  id: string
  name: string
  slug: string
  description: string | null
  display_order: number
  is_active: boolean
  image_url: string | null
}

type MenuItemDto = {
  id: string
  category_id: string
  name: string
  description: string | null
  price: number | null
  is_available: boolean
  is_veg: boolean
  delivery_available: boolean
  display_order: number
  image_url: string | null
}

type SpecialDto = {
  id: string
  title: string
  description: string | null
  price: number | null
  image_url: string | null
}

function toCategory(dto: CategoryDto): Category {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    description: dto.description ?? '',
    sortOrder: dto.display_order,
    imageUrl: dto.image_url ?? null,
  }
}

function toMenuItem(dto: MenuItemDto): MenuItem {
  return {
    id: dto.id,
    categoryId: dto.category_id,
    name: dto.name,
    description: dto.description ?? '',
    price: dto.price ?? 0,
    isVeg: dto.is_veg,
    deliveryAvailable: dto.delivery_available,
    sortOrder: dto.display_order,
    imageUrl: dto.image_url ?? null,
  }
}

function toSpecial(dto: SpecialDto): Special {
  return {
    id: dto.id,
    name: dto.title,
    description: dto.description ?? '',
    price: dto.price ?? 0,
    imageUrl: dto.image_url ?? null,
  }
}

export async function getCategories(): Promise<Category[]> {
  const rows = await apiGet<CategoryDto[]>('/api/v1/categories')
  return rows.map(toCategory).sort((a, b) => a.sortOrder - b.sortOrder)
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const rows = await apiGet<MenuItemDto[]>('/api/v1/menu-items')
  return rows.map(toMenuItem).sort((a, b) => a.sortOrder - b.sortOrder)
}

export async function getSpecials(): Promise<Special[]> {
  const rows = await apiGet<SpecialDto[]>('/api/v1/specials')
  return rows.map(toSpecial)
}

export async function getMenuItemById(id: string): Promise<MenuItem | undefined> {
  const items = await getMenuItems()
  return items.find((item) => item.id === id)
}

export async function searchMenuItems(query: string): Promise<MenuItem[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const [categories, items] = await Promise.all([getCategories(), getMenuItems()])
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name.toLowerCase()]))

  return items.filter((item) => {
    const categoryName = categoryNameById.get(item.categoryId) ?? ''
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      categoryName.includes(q)
    )
  })
}
