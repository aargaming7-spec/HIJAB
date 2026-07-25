// Matrix editor stok per warna × ukuran.
// Kalau produk tidak punya ukuran (misal aksesoris), tiap warna cuma
// punya satu baris stok (size = null).
export default function VariantStockEditor({ colors, sizes, variants, onChange }) {
  function getStock(color, size) {
    const found = variants.find(
      (v) => v.color === color && (v.size || null) === (size || null)
    )
    return found ? found.stock : ''
  }

  function setStock(color, size, value) {
    const next = variants.filter(
      (v) => !(v.color === color && (v.size || null) === (size || null))
    )
    next.push({ color, size: size || null, stock: value === '' ? 0 : Number(value) })
    onChange(next)
  }

  const totalStock = colors
    .flatMap((c) => (sizes.length ? sizes.map((s) => getStock(c, s)) : [getStock(c, null)]))
    .reduce((sum, v) => sum + (Number(v) || 0), 0)

  return (
    <div className="border border-line p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest2 text-ink/50">Stok per Varian</p>
        <p className="text-xs text-ink/50">Total: {totalStock}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          {sizes.length > 0 && (
            <thead>
              <tr>
                <th className="py-1 pr-2 text-left font-normal text-ink/50">Warna</th>
                {sizes.map((s) => (
                  <th key={s} className="px-1 py-1 text-center font-normal text-ink/50">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {colors.map((c) => (
              <tr key={c}>
                <td className="py-1 pr-2">{c}</td>
                {sizes.length > 0 ? (
                  sizes.map((s) => (
                    <td key={s} className="px-1 py-1">
                      <input
                        type="number"
                        min={0}
                        className="w-16 border border-line px-1.5 py-1 text-center"
                        value={getStock(c, s)}
                        onChange={(e) => setStock(c, s, e.target.value)}
                      />
                    </td>
                  ))
                ) : (
                  <td className="py-1">
                    <input
                      type="number"
                      min={0}
                      className="w-20 border border-line px-1.5 py-1 text-center"
                      value={getStock(c, null)}
                      onChange={(e) => setStock(c, null, e.target.value)}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
