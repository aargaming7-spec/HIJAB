import { Link } from 'react-router-dom'
import { useSiteSettings } from '../hooks/useSiteSettings.js'

export default function Hero() {
  const { settings } = useSiteSettings()
  const { eyebrow, title, subtitle, image, badge } = settings.hero

  return (
    <section className="relative">
      <div className="container-page grid grid-cols-1 md:grid-cols-12 md:items-stretch">
        <div className="md:col-span-7 md:col-start-1 relative order-2 md:order-1 flex flex-col justify-center py-10 md:py-0 pr-0 md:pr-10">
          <span className="eyebrow mb-5">{eyebrow}</span>
          <h1 className="font-display text-[2.4rem] leading-[1.08] md:text-[3.1rem] max-w-md">
            {title}
          </h1>
          <p className="mt-5 max-w-sm text-[15px] text-ink/65">{subtitle}</p>
          <div className="mt-8 flex items-center gap-4">
            <Link to="/shop" className="btn-primary">
              Shop Now
            </Link>
            <Link to="/shop?filter=new" className="text-sm underline underline-offset-4 hover:text-mauve-600 transition-colors duration-250">
              Lihat New Arrival
            </Link>
          </div>
        </div>

        <div className="md:col-span-5 order-1 md:order-2 relative">
          <div className="relative aspect-[4/5] md:aspect-auto md:h-[560px] overflow-hidden bg-mist">
            <img
              src={image}
              alt="Model mengenakan hijab voal koleksi terbaru Alara"
              className="h-full w-full object-cover"
            />
          </div>
          {/* signature element: vertical editorial label, echoing catalogue tab markers */}
          <div className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 items-center">
            <span
              className="text-[11px] tracking-[0.3em] uppercase text-ink/50 bg-paper px-3 py-4"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              {badge}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
