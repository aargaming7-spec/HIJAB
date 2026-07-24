import { useState } from 'react'
import Reveal from './Reveal.jsx'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
    setEmail('')
  }

  return (
    <section className="bg-ink">
      <div className="container-page py-16 md:py-20 text-center">
        <Reveal>
          <p className="eyebrow mb-3 text-paper/50">Newsletter</p>
          <h2 className="font-display text-2xl md:text-3xl text-paper">
            Dapatkan kabar koleksi terbaru.
          </h2>
          <p className="mt-3 text-sm text-paper/60">
            Tidak ada spam — hanya info rilis baru dan promo terbatas.
          </p>

          {submitted ? (
            <p className="mt-7 text-sm text-mauve-300">Terima kasih, kamu sudah terdaftar.</p>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Alamat email kamu"
                className="flex-1 border border-paper/20 bg-transparent px-4 py-3 text-sm text-paper outline-none placeholder:text-paper/40 focus:border-paper/50"
              />
              <button type="submit" className="bg-paper px-7 py-3 text-[13px] tracking-wide text-ink transition-colors duration-250 hover:bg-mauve-200">
                Subscribe
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
