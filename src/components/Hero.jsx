import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative">
      <div className="container-page grid grid-cols-1 md:grid-cols-12 md:items-stretch">
        <div className="md:col-span-7 md:col-start-1 relative order-2 md:order-1 flex flex-col justify-center py-10 md:py-0 pr-0 md:pr-10">
          <span className="eyebrow mb-5">Koleksi Pertengahan Tahun</span>
          <h1 className="font-display text-[2.4rem] leading-[1.08] md:text-[3.1rem] max-w-md">
            Voal yang jatuh dengan sendirinya.
          </h1>
          <p className="mt-5 max-w-sm text-[15px] text-ink/65">
            Kami membuat pilihan bahan lebih sedikit, tapi lebih tepat — supaya hijab yang kamu
            pakai hari ini masih terasa sama nyamannya tahun depan.
          </p>
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
              src="https://picsum.photos/seed/hero-main/900/1100"
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
              Edisi 07 — 2026
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
