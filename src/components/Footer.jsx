import { Link } from 'react-router-dom'
import { Instagram, MessageCircle, Music2 } from 'lucide-react'

const columns = [
  {
    title: 'Alara',
    links: [
      { label: 'Tentang Kami', to: '/about' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Shop',
    links: [
      { label: 'Semua Produk', to: '/shop' },
      { label: 'New Arrival', to: '/shop?filter=new' },
      { label: 'Best Seller', to: '/shop?filter=best' },
      { label: 'Sale', to: '/shop?filter=sale' },
    ],
  },
  {
    title: 'Customer Service',
    links: [
      { label: 'FAQ', to: '/contact' },
      { label: 'Pengiriman', to: '/contact' },
      { label: 'Return', to: '/contact' },
      { label: 'Contact', to: '/contact' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-line bg-mist">
      <div className="container-page py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Link to="/" className="font-display text-lg tracking-widest2 uppercase">
              Alara
            </Link>
            <p className="mt-4 max-w-xs text-sm text-ink/60">
              Hijab dan modest essentials dengan bahan yang dipilih untuk dipakai setiap hari,
              bukan hanya untuk difoto.
            </p>
            <div className="mt-5 flex items-center gap-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-ink/60 hover:text-mauve-600 transition-colors duration-250">
                <Instagram size={18} />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok" className="text-ink/60 hover:text-mauve-600 transition-colors duration-250">
                <Music2 size={18} />
              </a>
              <a href="https://wa.me/6280000000000" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="text-ink/60 hover:text-mauve-600 transition-colors duration-250">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="eyebrow mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-ink/70 hover:text-mauve-600 transition-colors duration-250">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink/50 md:flex-row">
          <p>© {new Date().getFullYear()} Alara. All rights reserved.</p>
          <p>Dibuat dengan hati-hati, di Indonesia.</p>
        </div>
      </div>
    </footer>
  )
}
