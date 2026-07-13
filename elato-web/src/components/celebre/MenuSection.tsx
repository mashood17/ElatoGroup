import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MenuSearchBar } from './menu/MenuSearchBar'
import { CategoryRow } from './menu/CategoryRow'
import { SearchResultsGrid } from './menu/SearchResultsGrid'
import { ItemDetailModal } from './menu/ItemDetailModal'
import { getCategories, getMenuItems, searchMenuItems } from '../../lib/menuRepository'
import type { Category, MenuItem } from '../../content/celebreContent'
import { sectionReveal, viewportOnce } from '../../lib/motion'

export function MenuSection() {
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<MenuItem[]>([])
  const [searching, setSearching] = useState(false)
  const [openItemId, setOpenItemId] = useState<string | null>(null)

  useEffect(() => {
    getCategories().then(setCategories)
    getMenuItems().then(setMenuItems)
  }, [])

  useEffect(() => {
    if (!query) {
      setSearchResults([])
      return
    }
    setSearching(true)
    searchMenuItems(query).then((results) => {
      setSearchResults(results)
      setSearching(false)
    })
  }, [query])

  const itemsByCategory = useMemo(() => {
    if (!menuItems) return new Map<string, MenuItem[]>()
    const map = new Map<string, MenuItem[]>()
    for (const item of menuItems) {
      const list = map.get(item.categoryId) ?? []
      list.push(item)
      map.set(item.categoryId, list)
    }
    return map
  }, [menuItems])

  return (
    <section id="menu" className="bg-surface-base">
      <MenuSearchBar onQueryChange={setQuery} />

      <div className="container-elato">
        {query ? (
          <SearchResultsGrid
            items={searchResults}
            loading={searching}
            query={query}
            onOpenItem={setOpenItemId}
          />
        ) : !categories || !menuItems ? (
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={sectionReveal}
            className="text-body py-16 text-center text-neutral-warm-500"
          >
            Loading the menu…
          </motion.p>
        ) : (
          <div className="divide-y divide-primary-100">
            {categories.map((category, i) => (
              <CategoryRow
                key={category.id}
                category={category}
                items={itemsByCategory.get(category.id) ?? []}
                index={i}
                onOpenItem={setOpenItemId}
              />
            ))}
          </div>
        )}
      </div>

      <ItemDetailModal itemId={openItemId} onClose={() => setOpenItemId(null)} />
    </section>
  )
}
