import { Gem, Truck, ShieldCheck, Headset } from 'lucide-react'
import Reveal from './Reveal.jsx'

const points = [
  { icon: Gem, title: 'Premium Quality', desc: 'Bahan dipilih dan diuji sebelum masuk katalog.' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Dikirim dari Bandung dalam 1x24 jam kerja.' },
  { icon: ShieldCheck, title: 'Secure Payment', desc: 'Transaksi terenkripsi dan terverifikasi.' },
  { icon: Headset, title: 'Customer Support', desc: 'Tim kami siap membantu lewat WhatsApp.' },
]

export default function WhyChooseUs() {
  return (
    <section className="border-y border-line bg-mist">
      <div className="container-page grid grid-cols-2 gap-8 py-14 md:grid-cols-4 md:gap-6">
        {points.map((p, i) => (
          <Reveal key={p.title} delay={i * 60} className="flex flex-col items-start gap-3">
            <p.icon size={22} strokeWidth={1.4} className="text-mauve-600" />
            <div>
              <p className="text-sm font-medium">{p.title}</p>
              <p className="mt-1 text-xs text-ink/55 leading-relaxed">{p.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
