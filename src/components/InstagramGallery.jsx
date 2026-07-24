import { Instagram } from 'lucide-react'
import Reveal from './Reveal.jsx'

const seeds = ['ig-1', 'ig-2', 'ig-3', 'ig-4', 'ig-5', 'ig-6']

export default function InstagramGallery() {
  return (
    <section className="container-page py-16 md:py-24">
      <Reveal className="mb-10 flex items-end justify-between">
        <div>
          <span className="eyebrow mb-3 block">Bersama Komunitas</span>
          <h2 className="section-title">@alara.id</h2>
        </div>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-2 text-sm text-ink/60 hover:text-mauve-600 transition-colors duration-250 md:flex"
        >
          <Instagram size={16} /> Follow
        </a>
      </Reveal>

      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {seeds.map((seed, i) => (
          <Reveal key={seed} delay={i * 40} className="relative aspect-square overflow-hidden bg-mist group">
            <img
              src={`https://picsum.photos/seed/${seed}/500/500`}
              alt="Konten komunitas Alara"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-350 ease-out group-hover:scale-105"
            />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
