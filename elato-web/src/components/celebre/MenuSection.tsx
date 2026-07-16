import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MenuSearchBar } from './menu/MenuSearchBar'
import { CategoryRow } from './menu/CategoryRow'
import { SearchResultsGrid } from './menu/SearchResultsGrid'
import { ItemDetailModal } from './menu/ItemDetailModal'
import { getCategories, getMenuItems, searchMenuItems } from '../../lib/menuRepository'
import type { Category, MenuItem } from '../../content/celebreContent'
import { sectionReveal, viewportOnce } from '../../lib/motion'
import bgDesktop from '../../assets/newbg/bg2.png'
import bgMobile from '../../assets/newbg/bg-mb2.png'

export function MenuSection() {
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<MenuItem[]>([])
  const [searching, setSearching] = useState(false)
  const [openItemId, setOpenItemId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)
  const requestId = useRef(0)

  const loadMenu = () => {
    const id = ++requestId.current
    setLoadError(false)
    setCategories(null)
    setMenuItems(null)
    Promise.all([getCategories(), getMenuItems()])
      .then(([cats, items]) => {
        if (requestId.current !== id) return
        setCategories(cats)
        setMenuItems(items)
      })
      .catch(() => {
        // Same stale-request guard as FeaturedSpecials — without it, an
        // older in-flight request (StrictMode's double effect invoke, or an
        // overlapping "Try again" click) can reject after a newer one has
        // already succeeded and permanently flip the section to the error
        // state despite the menu having loaded correctly.
        if (requestId.current === id) setLoadError(true)
      })
  }

  useEffect(() => {
    loadMenu()
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
    <section id="menu" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-cover bg-center sm:hidden" style={{ backgroundImage: `url(${bgMobile})` }} aria-hidden="true" />
      <div className="absolute inset-0 -z-10 hidden bg-cover bg-center sm:block" style={{ backgroundImage: `url(${bgDesktop})` }} aria-hidden="true" />

      <div className="container-elato pb-4 pt-16 text-center lg:pb-6 lg:pt-32">
        <motion.div initial="hidden" whileInView="visible" viewport={viewportOnce} variants={sectionReveal}>
          <p className="text-caption text-secondary-500">Curated Menu</p>
          <h2 className="text-h2 mt-3 font-sans font-bold text-[#9e7641] lg:text-[44px] lg:leading-[1.1]">
            Explore the Complete ELATŌ Collection
          </h2>
        </motion.div>
      </div>

      <MenuSearchBar onQueryChange={setQuery} />

      <div className="container-elato">
        {query ? (
          <SearchResultsGrid
            items={searchResults}
            loading={searching}
            query={query}
            onOpenItem={setOpenItemId}
          />
        ) : loadError ? (
          <div className="py-16 text-center">
            <p className="text-body text-neutral-warm-500">The menu couldn&rsquo;t be loaded right now.</p>
            <button
              type="button"
              onClick={loadMenu}
              className="text-body mt-3 font-semibold text-secondary-500 hover:underline"
            >
              Try again
            </button>
          </div>
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
