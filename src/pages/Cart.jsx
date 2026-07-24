import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { formatIDR } from '../utils/format.js'

export default function Cart() {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <p className="eyebrow mb-3">Keranjang</p>
        <h1 className="section-title mb-5">Keranjang kamu masih kosong</h1>
        <Link to="/shop" className="btn-primary inline-flex">
          Mulai Belanja
        </Link>
      </div>
    )
  }

  return (
    <div className="container-page py-10 md:py-14">
      <p className="eyebrow mb-3">Keranjang</p>
      <h1 className="section-title mb-10">Belanja Kamu ({items.length})</h1>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-line border-y border-line">
          {items.map((it) => (
            <li key={it.key} className="flex gap-5 py-6">
              <img src={it.image} alt={it.name} className="h-32 w-24 object-cover bg-mist" />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-sm">{it.name}</p>
                  <p className="mt-1 text-xs text-ink/50">{[it.color, it.size].filter(Boolean).join(' · ')}</p>
                  <p className="mt-2 text-sm text-mauve-600">{formatIDR(it.price)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-line">
                    <button
                      className="grid h-8 w-8 place-items-center hover:bg-mist"
                      onClick={() => updateQuantity(it.key, it.quantity - 1)}
                      aria-label="Kurangi jumlah"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-9 text-center text-sm">{it.quantity}</span>
                    <button
                      className="grid h-8 w-8 place-items-center hover:bg-mist"
                      onClick={() => updateQuantity(it.key, it.quantity + 1)}
                      aria-label="Tambah jumlah"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(it.key)}
                    aria-label="Hapus dari keranjang"
                    className="flex items-center gap-1.5 text-xs text-ink/40 hover:text-mauve-600 transition-colors duration-250"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit border border-line p-6">
          <p className="mb-5 font-display text-sm tracking-widest2 uppercase">Ringkasan</p>
          <div className="flex items-center justify-between text-sm text-ink/60">
            <span>Subtotal</span>
            <span>{formatIDR(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs text-ink/40">Ongkos kirim dihitung saat checkout.</p>
          <button className="btn-primary mt-6 w-full">Checkout</button>
          <Link to="/shop" className="mt-4 block text-center text-xs text-ink/50 underline underline-offset-4 hover:text-mauve-600 transition-colors duration-250">
            Lanjut Belanja
          </Link>
        </div>
      </div>
    </div>
  )
}
