import { Link } from 'react-router-dom'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatIDR } from '../utils/format'

export default function CartDrawer() {
  const { items, isCartOpen, setCartOpen, removeFromCart, updateQuantity, subtotal } = useCart()

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-250 ${
        isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 bg-ink/40" onClick={() => setCartOpen(false)} />
      <div
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper transition-transform duration-350 ease-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-line px-6">
          <p className="font-display text-sm tracking-widest2 uppercase">Keranjang ({items.length})</p>
          <button onClick={() => setCartOpen(false)} aria-label="Tutup keranjang">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-ink/60">Keranjang kamu masih kosong.</p>
              <Link to="/shop" onClick={() => setCartOpen(false)} className="btn-outline mt-2">
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((it) => (
                <li key={it.key} className="flex gap-4 py-5">
                  <img src={it.image} alt={it.name} className="h-24 w-20 object-cover bg-mist" />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-sm">{it.name}</p>
                      <p className="text-xs text-ink/50">
                        {[it.color, it.size].filter(Boolean).join(' · ')}
                      </p>
                      <p className="mt-1 text-sm text-mauve-600">{formatIDR(it.price)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-line">
                        <button
                          className="grid h-7 w-7 place-items-center hover:bg-mist"
                          onClick={() => updateQuantity(it.key, it.quantity - 1)}
                          aria-label="Kurangi jumlah"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-sm">{it.quantity}</span>
                        <button
                          className="grid h-7 w-7 place-items-center hover:bg-mist"
                          onClick={() => updateQuantity(it.key, it.quantity + 1)}
                          aria-label="Tambah jumlah"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(it.key)}
                        aria-label="Hapus dari keranjang"
                        className="text-ink/40 hover:text-mauve-600 transition-colors duration-250"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line px-6 py-6">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-ink/60">Subtotal</span>
              <span className="text-base">{formatIDR(subtotal)}</span>
            </div>
            <Link to="/cart" onClick={() => setCartOpen(false)} className="btn-primary w-full">
              Lihat Keranjang
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
