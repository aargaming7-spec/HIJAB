import { Link } from 'react-router-dom'
import Reveal from './Reveal.jsx'
import { useSiteSettings } from '../hooks/useSiteSettings.js'

export default function PromoBanner() {
  const { settings } = useSiteSettings()
  const { eyebrow, title, image, ctaLabel, ctaLink } = settings.promo

  return (
    <section className="container-page py-16 md:py-24">
      <Reveal>
        <div className="relative overflow-hidden bg-mist">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative aspect-[4/3] md:aspect-auto">
              <img
                src={image}
                alt="Koleksi pashmina edisi terbatas Alara"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center px-8 py-12 md:px-14">
              <span className="eyebrow mb-4">{eyebrow}</span>
              <h2 className="font-display text-2xl md:text-[2rem] leading-tight max-w-sm">
                {title}
              </h2>
              <Link to={ctaLink} className="btn-primary mt-7 w-fit">
                {ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
