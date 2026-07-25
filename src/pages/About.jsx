import Reveal from '../components/Reveal.jsx'
import { useSiteSettings } from '../hooks/useSiteSettings.js'

export default function About() {
  const { settings } = useSiteSettings()
  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="eyebrow mb-3">Tentang Kami</p>
          <h1 className="font-display text-3xl md:text-4xl">{settings.about.title}</h1>
          <p className="mt-6 text-ink/70 leading-relaxed">{settings.about.body}</p>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-10 md:grid-cols-3">
        <Reveal delay={80}>
          <div>
            <p className="font-display text-2xl text-mauve-600">2019</p>
            <p className="mt-2 text-sm text-ink/60">Mulai berproduksi dari rumah dengan koleksi Voal pertama.</p>
          </div>
        </Reveal>
        <Reveal delay={160}>
          <div>
            <p className="font-display text-2xl text-mauve-600">50rb+</p>
            <p className="mt-2 text-sm text-ink/60">Produk terkirim ke pelanggan di seluruh Indonesia.</p>
          </div>
        </Reveal>
        <Reveal delay={240}>
          <div>
            <p className="font-display text-2xl text-mauve-600">100%</p>
            <p className="mt-2 text-sm text-ink/60">Bahan dipilih dan diuji langsung oleh tim kami.</p>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
