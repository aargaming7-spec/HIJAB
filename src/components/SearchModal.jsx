import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Search } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { formatIDR } from '../utils/format'

export default function SearchModal({ open, onClose }) {
  const { products } = useProducts()
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    // Pakai (field || '') supaya kalau ada produk yang belum lengkap diisi
    // (nama/kategori/koleksi kosong), pencarian tetap jalan — tidak crash
    // dan bikin seluruh halaman jadi putih kosong.
    return products
      .filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.collection || '').toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [query, products])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative mx-auto mt-24 w-[92%] max-w-xl bg-paper shadow-lg animate-fadeUp">
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <Search size={18} className="text-ink/50" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari produk, kategori, atau koleksi..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink/40"
          />
          <button onClick={onClose} aria-label="Tutup pencarian">
            <X size={18} />
          </button>
        </div>

        {query.trim() && (
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="px-4 py-6 text-sm text-ink/50">Tidak ditemukan produk untuk "{query}".</p>
            ) : (
              results.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  onClick={onClose}
                  className="flex items-center gap-4 px-3 py-2.5 hover:bg-mist transition-colors duration-250"
                >
                  <img src={p.images?.[0] || ''} alt="" className="h-14 w-12 object-cover bg-mist" />
                  <div>
                    <p className="text-sm">{p.name}</p>
                    <p className="text-xs text-ink/50">
                      {p.collection} · {formatIDR(p.discountPrice || p.price)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
