import { useState } from 'react'
import { Mail, MessageCircle, MapPin } from 'lucide-react'
import Reveal from '../components/Reveal.jsx'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="container-page py-16 md:py-24">
      <div className="mb-12 max-w-xl">
        <Reveal>
          <p className="eyebrow mb-3">Hubungi Kami</p>
          <h1 className="font-display text-3xl md:text-4xl">Ada pertanyaan?</h1>
          <p className="mt-4 text-ink/70">
            Tim kami siap membantu untuk pertanyaan produk, pesanan, atau kerja sama.
          </p>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <Reveal>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest2 text-ink/50">Nama</label>
              <input required type="text" className="input-field" placeholder="Nama lengkap" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest2 text-ink/50">Email</label>
              <input required type="email" className="input-field" placeholder="nama@email.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest2 text-ink/50">Pesan</label>
              <textarea required rows={5} className="input-field resize-none" placeholder="Tulis pesan kamu di sini" />
            </div>
            <button type="submit" className="btn-primary w-full sm:w-auto">
              Kirim Pesan
            </button>
            {submitted && (
              <p className="text-sm text-mauve-600">Terima kasih, pesan kamu sudah kami terima.</p>
            )}
          </form>
        </Reveal>

        <Reveal delay={100}>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Mail size={18} className="mt-0.5 text-mauve-600" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-ink/60">hello@alara.co.id</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MessageCircle size={18} className="mt-0.5 text-mauve-600" />
              <div>
                <p className="text-sm font-medium">WhatsApp</p>
                <p className="text-sm text-ink/60">+62 812 3456 7890</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin size={18} className="mt-0.5 text-mauve-600" />
              <div>
                <p className="text-sm font-medium">Studio</p>
                <p className="text-sm text-ink/60">Bandung, Jawa Barat, Indonesia</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
