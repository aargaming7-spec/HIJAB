import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import products, { categories, collections } from '../data/products.js'
import FilterSidebar from '../components/FilterSidebar.jsx'
import ProductGrid from '../components/ProductGrid.jsx'

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'bestseller', label: 'Best Seller' },
  { value: 'price-asc', label: 'Price Low to High' },
  { value: 'price-desc', label: 'Price High to Low' },
]

const emptyFilters = {
  category: [],
  collection: [],
  color: [],
  priceRange: null,
  inStockOnly: false,
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState(emptyFilters)
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    const sortParam = searchParams.get('sort')
    if (sortParam) setSort(sortParam)
  }, [searchParams])

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (filters.category.length && !filters.category.includes(p.category)) return false
      if (filters.collection.length && !filters.collection.includes(p.collection)) return false
      if (filters.color.length && !p.colors?.some((c) => filters.color.includes(c))) return false
      if (filters.priceRange) {
        const price = p.discountPrice ?? p.price
        if (price < filters.priceRange.min || price >= filters.priceRange.max) return false
      }
      if (filters.inStockOnly && p.stock <= 0) return false
      return true
    })

    list = [...list].sort((a, b) => {
      if (sort === 'price-asc') return (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price)
      if (sort === 'price-desc') return (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price)
      if (sort === 'bestseller') return Number(b.isBestSeller) - Number(a.isBestSeller)
      return Number(b.isNewArrival) - Number(a.isNewArrival)
    })

    return list
  }, [filters, sort])

  function handleSortChange(value) {
    setSort(value)
    setSearchParams(value === 'newest' ? {} : { sort: value })
  }

  const activeFilterCount =
    filters.category.length + filters.collection.length + filters.color.length + (filters.priceRange ? 1 : 0) + (filters.inStockOnly ? 1 : 0)

  return (
    <div className="container-page py-10 md:py-16">
      <div className="mb-8">
        <p className="eyebrow mb-2">Koleksi</p>
        <h1 className="font-display text-3xl md:text-4xl">Shop</h1>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <FilterSidebar filters={filters} setFilters={setFilters} categories={categories} collections={collections} />
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
            <p className="text-sm text-ink/60">{filtered.length} produk</p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 border border-line px-3 py-2 text-xs tracking-wide lg:hidden"
              >
                <SlidersHorizontal size={14} />
                Filter
                {activeFilterCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] text-paper">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-line bg-paper px-3 py-2 text-xs tracking-wide outline-none focus:border-mauve-400"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ProductGrid products={filtered} />
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Tutup filter"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto bg-paper p-6 shadow-xl animate-fadeUp">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-display text-lg">Filter</p>
              <button aria-label="Tutup" onClick={() => setMobileFiltersOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <FilterSidebar filters={filters} setFilters={setFilters} categories={categories} collections={collections} />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="btn-primary mt-8 w-full"
            >
              Tampilkan {filtered.length} Produk
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
