import { Link } from 'react-router-dom'
import Reveal from './Reveal'

const categories = [
  { name: 'Voal', seed: 'cat-voal' },
  { name: 'Pashmina', seed: 'cat-pashmina' },
  { name: 'Segi Empat', seed: 'cat-segiempat' },
  { name: 'Instant', seed: 'cat-instant' },
  { name: 'Accessories', seed: 'cat-accessories' },
]

export default function CategorySection() {
  return (
    <section className="container-page py-16 md:py-24">
      <Reveal className="mb-10 flex items-end justify-between">
        <div>
          <span className="eyebrow mb-3 block">Belanja per Kategori</span>
          <h2 className="font-display text-2xl md:text-3xl">Temukan yang kamu cari</h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">
        {categories.map((cat, i) => (
          <Reveal key={cat.name} delay={i * 60}>
            <Link to={`/shop?collection=${encodeURIComponent(cat.name)}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden bg-mist">
                <img
                  src={`https://picsum.photos/seed/${cat.seed}/500/650`}
                  alt={cat.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-350 ease-out group-hover:scale-105"
                />
              </div>
              <p className="mt-3 text-sm tracking-wide">{cat.name}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
