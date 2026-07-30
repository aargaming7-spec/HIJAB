import { useState } from 'react'
import { Star } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

export default function ReviewForm({ productId, onSubmitted }) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!isSupabaseConfigured) {
      setError('Supabase belum dikonfigurasi, review tidak bisa dikirim.')
      return
    }
    if (rating === 0) {
      setError('Pilih rating bintang dulu, ya.')
      return
    }
    if (name.trim().length === 0 || text.trim().length === 0) {
      setError('Nama dan ulasan tidak boleh kosong.')
      return
    }

    setSaving(true)
    const { error: insertError } = await supabase.from('reviews').insert({
      product_id: productId,
      name: name.trim().slice(0, 60),
      rating,
      text: text.trim().slice(0, 1000),
    })
    setSaving(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    setDone(true)
    setName('')
    setRating(0)
    setText('')
    onSubmitted?.()
  }

  if (done) {
    return (
      <div className="border border-line bg-mist p-4 text-sm text-ink/70">
        Terima kasih! Ulasan kamu sudah terkirim.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line p-4 md:p-5">
      <p className="mb-4 text-sm text-ink">Tulis ulasan</p>

      <div className="mb-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`Beri rating ${n} bintang`}
            className="p-0.5"
          >
            <Star
              size={20}
              className={(hoverRating || rating) >= n ? 'fill-gold text-gold' : 'text-line'}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>

      <input
        placeholder="Nama kamu"
        maxLength={60}
        className="input-field mb-3"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        placeholder="Bagaimana pengalaman kamu dengan produk ini?"
        maxLength={1000}
        rows={3}
        className="input-field mb-3 resize-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

      <button type="submit" disabled={saving} className="btn-outline text-xs disabled:opacity-50">
        {saving ? 'Mengirim...' : 'Kirim Ulasan'}
      </button>
    </form>
  )
}
