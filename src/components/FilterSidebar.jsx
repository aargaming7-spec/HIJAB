const priceRanges = [
  { label: 'Di bawah Rp 100.000', min: 0, max: 100000 },
  { label: 'Rp 100.000 – Rp 150.000', min: 100000, max: 150000 },
  { label: 'Rp 150.000 – Rp 200.000', min: 150000, max: 200000 },
  { label: 'Di atas Rp 200.000', min: 200000, max: Infinity },
]

const colorOptions = ['Black', 'Ivory', 'Dusty Rose', 'Mauve', 'Sand', 'Charcoal', 'Sage', 'Navy']

export default function FilterSidebar({ filters, setFilters, categories, collections }) {
  function toggleValue(key, value) {
    setFilters((prev) => {
      const current = prev[key]
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...prev, [key]: next }
    })
  }

  function togglePrice(range) {
    setFilters((prev) => ({
      ...prev,
      priceRange: prev.priceRange?.label === range.label ? null : range,
    }))
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-3">Category</p>
        <ul className="space-y-2">
          {categories.map((c) => (
            <li key={c}>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.category.includes(c)}
                  onChange={() => toggleValue('category', c)}
                  className="accent-mauve-500"
                />
                {c}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="eyebrow mb-3">Collection</p>
        <ul className="space-y-2">
          {collections.map((c) => (
            <li key={c}>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.collection.includes(c)}
                  onChange={() => toggleValue('collection', c)}
                  className="accent-mauve-500"
                />
                {c}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="eyebrow mb-3">Price</p>
        <ul className="space-y-2">
          {priceRanges.map((range) => (
            <li key={range.label}>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="price"
                  checked={filters.priceRange?.label === range.label}
                  onChange={() => togglePrice(range)}
                  className="accent-mauve-500"
                />
                {range.label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="eyebrow mb-3">Color</p>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => toggleValue('color', color)}
              className={`border px-2.5 py-1 text-xs transition-colors duration-250 ${
                filters.color.includes(color)
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line text-ink/70 hover:border-ink'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-3">Availability</p>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={() => setFilters((prev) => ({ ...prev, inStockOnly: !prev.inStockOnly }))}
            className="accent-mauve-500"
          />
          Hanya yang tersedia
        </label>
      </div>
    </div>
  )
}
