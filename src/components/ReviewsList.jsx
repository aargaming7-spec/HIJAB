import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'
import StarRating from './StarRating.jsx'
import ReviewForm from './ReviewForm.jsx'

export default function ReviewsList({ productId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !productId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('approved', true)
      .order('created_at', { ascending: false })
    setReviews(data || [])
    setLoading(false)
  }, [productId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  if (!isSupabaseConfigured) {
    return (
      <p className="text-sm text-ink/50">
        Review pelanggan akan tampil di sini setelah Supabase dikonfigurasi.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {reviews.length > 0 ? (
            <div className="flex items-center gap-2">
              <StarRating value={average} />
              <span className="text-xs text-ink/50">
                dari {reviews.length} ulasan
              </span>
            </div>
          ) : (
            <p className="text-sm text-ink/50">Belum ada ulasan untuk produk ini.</p>
          )}
        </div>
        <button onClick={() => setFormOpen((v) => !v)} className="btn-outline text-xs">
          {formOpen ? 'Batal' : 'Tulis Ulasan'}
        </button>
      </div>

      {formOpen && (
        <ReviewForm
          productId={productId}
          onSubmitted={() => {
            setFormOpen(false)
            refresh()
          }}
        />
      )}

      {loading ? (
        <p className="text-sm text-ink/40">Memuat ulasan...</p>
      ) : (
        reviews.length > 0 && (
          <div className="space-y-6">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-line pb-5">
                <div className="flex items-center justify-between">
                  <p className="text-ink">{r.name}</p>
                  <StarRating value={r.rating} />
                </div>
                <p className="mt-2 text-ink/60">{r.text}</p>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
