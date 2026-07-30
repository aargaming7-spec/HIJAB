import { useEffect, useState } from 'react'
import { Trash2, EyeOff, Eye } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import StarRating from './StarRating.jsx'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [products, setProducts] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | approved | hidden

  async function refresh() {
    setLoading(true)
    const [{ data: reviewData }, { data: productData }] = await Promise.all([
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('id, name'),
    ])
    setReviews(reviewData || [])
    setProducts(Object.fromEntries((productData || []).map((p) => [p.id, p.name])))
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function toggleApproved(review) {
    const { error } = await supabase
      .from('reviews')
      .update({ approved: !review.approved })
      .eq('id', review.id)
    if (error) {
      alert(error.message)
      return
    }
    refresh()
  }

  async function handleDelete(id) {
    if (!confirm('Hapus review ini?')) return
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) {
      alert(error.message)
      return
    }
    refresh()
  }

  const filtered = reviews.filter((r) => {
    if (filter === 'approved') return r.approved
    if (filter === 'hidden') return !r.approved
    return true
  })

  return (
    <div>
      <div className="mb-5 flex gap-2 text-xs">
        {[
          { value: 'all', label: 'Semua' },
          { value: 'approved', label: 'Tampil' },
          { value: 'hidden', label: 'Disembunyikan' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`border px-3 py-1.5 ${
              filter === f.value ? 'border-ink bg-ink text-paper' : 'border-line text-ink/60'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink/50">Memuat review...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink/50">Belum ada review.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="border border-line p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-ink/40">{products[r.product_id] || 'Produk tidak diketahui'}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-sm text-ink">{r.name}</p>
                    <StarRating value={r.rating} />
                    {!r.approved && (
                      <span className="bg-mist px-2 py-0.5 text-[10px] text-ink/50">Disembunyikan</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-ink/60">{r.text}</p>
                  <p className="mt-2 text-[11px] text-ink/35">
                    {new Date(r.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleApproved(r)}
                    aria-label={r.approved ? 'Sembunyikan' : 'Tampilkan'}
                    className="grid h-8 w-8 place-items-center hover:text-mauve-600"
                    title={r.approved ? 'Sembunyikan review' : 'Tampilkan review'}
                  >
                    {r.approved ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    aria-label="Hapus"
                    className="grid h-8 w-8 place-items-center hover:text-red-600"
                    title="Hapus review"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
