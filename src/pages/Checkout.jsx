import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { callEdgeFunction } from '../lib/edgeFunctions.js'
import { formatIDR } from '../utils/format.js'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY
const MIDTRANS_IS_PRODUCTION = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
const SHIPPING_COST = 15000

// Data produk lama (fallback lokal, sebelum admin import ke Supabase) pakai
// id seperti "voal-clara", bukan UUID. Kolom product_id di database bertipe
// uuid, jadi kalau id-nya bukan format UUID, dikirim null saja (nama produk
// tetap tersimpan di order_items, cuma relasinya ke tabel products dilepas).
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function safeProductId(id) {
  return UUID_REGEX.test(id) ? id : null
}

// Selama Midtrans belum di-setup (VITE_MIDTRANS_CLIENT_KEY kosong), checkout
// jalan dalam mode "dummy": order tetap tersimpan ke Supabase & bisa dilihat
// di Admin/Track Order, tapi tanpa proses pembayaran sungguhan.
const DUMMY_MODE = !MIDTRANS_CLIENT_KEY

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', postalCode: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [snapReady, setSnapReady] = useState(false)

  useEffect(() => {
    if (!MIDTRANS_CLIENT_KEY || DUMMY_MODE) return
    const script = document.createElement('script')
    script.src = MIDTRANS_IS_PRODUCTION
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY)
    script.onload = () => setSnapReady(true)
    document.body.appendChild(script)
    return () => document.body.removeChild(script)
  }, [])

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <p className="eyebrow mb-3">Checkout</p>
        <h1 className="section-title mb-5">Keranjang kamu masih kosong</h1>
        <Link to="/shop" className="btn-primary inline-flex">
          Jelajahi Produk
        </Link>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!isSupabaseConfigured) {
      setError('Supabase belum dikonfigurasi.')
      return
    }

    setLoading(true)

    if (DUMMY_MODE) {
      // Mode dummy: insert order langsung dari frontend, tanpa payment gateway.
      // ID order dibuat di sisi website (crypto.randomUUID()), bukan minta
      // balikan dari Supabase (.select()) setelah insert. Ini sengaja: kalau
      // pakai .select(), Supabase perlu izin SELECT pada baris yang baru saja
      // dibuat, dan pengunjung biasa (anon) tidak (dan sebaiknya tidak) diberi
      // izin itu — supaya orang lain nggak bisa baca semua pesanan orang lain.
      // Dengan ID dibuat sendiri, kita tidak pernah perlu baca balik dari DB.
      const orderId = crypto.randomUUID()
      const orderNumber = `ALR-DUMMY-${Date.now()}`

      const { error: orderError } = await supabase.from('orders').insert({
        id: orderId,
        order_number: orderNumber,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email || null,
        shipping_address: form.address,
        city: form.city || null,
        postal_code: form.postalCode || null,
        notes: form.notes || null,
        subtotal,
        shipping_cost: SHIPPING_COST,
        total,
        payment_status: 'pending', // belum ada payment gateway, jadi selalu "pending"
        order_status: 'processing',
      })

      if (orderError) {
        setLoading(false)
        setError(orderError.message)
        return
      }

      const orderItems = items.map((it) => ({
        order_id: orderId,
        product_id: safeProductId(it.productId),
        product_name: it.name,
        product_image: it.image,
        color: it.color,
        size: it.size,
        price: it.price,
        quantity: it.quantity,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

      if (itemsError) {
        setLoading(false)
        setError(itemsError.message)
        return
      }

      // Kurangi stok produk (aman dari race condition, dihitung di sisi
      // database — lihat supabase/stock_decrement.sql). Kalau function ini
      // belum ada di database (misal belum jalanin SQL patch-nya), checkout
      // tetap lanjut — cuma stok nggak ikut berkurang.
      const stockItems = orderItems
        .filter((it) => it.product_id)
        .map((it) => ({ product_id: it.product_id, color: it.color, size: it.size, quantity: it.quantity }))
      if (stockItems.length > 0) {
        await supabase.rpc('decrement_product_stock', { items: stockItems })
      }

      setLoading(false)
      clearCart()
      navigate(`/order-success?order=${orderNumber}&dummy=1`)
      return
    }

    if (!MIDTRANS_CLIENT_KEY || !snapReady) {
      setLoading(false)
      setError('Payment gateway belum siap. Pastikan VITE_MIDTRANS_CLIENT_KEY sudah diisi.')
      return
    }

    const { data, error } = await callEdgeFunction('create-transaction', {
      customer: form,
      items: items.map((i) => ({
        id: i.productId,
        name: i.name,
        image: i.image,
        color: i.color,
        size: i.size,
        price: i.price,
        quantity: i.quantity,
      })),
      shippingCost: SHIPPING_COST,
    })

    setLoading(false)

    if (error) {
      setError(error)
      return
    }

    window.snap.pay(data.snapToken, {
      onSuccess: () => {
        clearCart()
        navigate(`/order-success?order=${data.orderNumber}`)
      },
      onPending: () => {
        clearCart()
        navigate(`/order-success?order=${data.orderNumber}`)
      },
      onError: () => setError('Pembayaran gagal, silakan coba lagi.'),
      onClose: () => setError('Kamu menutup jendela pembayaran sebelum selesai.'),
    })
  }

  const total = subtotal + SHIPPING_COST

  return (
    <div className="container-page py-10 md:py-16">
      <p className="eyebrow mb-2">Checkout</p>
      <h1 className="mb-10 font-display text-2xl md:text-3xl">Selesaikan Pesanan</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          {DUMMY_MODE && (
            <p className="border border-line bg-mist p-3 text-xs text-ink/60">
              Mode uji coba — checkout ini belum tersambung ke payment gateway. Pesanan tetap
              tersimpan di database (bisa dicek di Admin atau Lacak Pesanan), tapi status
              pembayaran akan selalu "Menunggu Pembayaran".
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input required placeholder="Nama lengkap" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required placeholder="No. HP / WhatsApp" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <input type="email" placeholder="Email (opsional)" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <textarea required rows={3} placeholder="Alamat lengkap" className="input-field resize-none" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input placeholder="Kota" className="input-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input placeholder="Kode pos" className="input-field" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
          </div>
          <textarea rows={2} placeholder="Catatan (opsional)" className="input-field resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Memproses...' : DUMMY_MODE ? `Buat Pesanan (Dummy) — ${formatIDR(total)}` : `Bayar ${formatIDR(total)}`}
          </button>
        </form>

        <div className="h-fit border border-line p-6">
          <p className="mb-4 font-display text-lg">Ringkasan Pesanan</p>
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.key} className="flex items-center gap-3 text-sm">
                <img src={it.image} alt={it.name} className="h-14 w-11 object-cover" />
                <div className="flex-1">
                  <p>{it.name}</p>
                  <p className="text-ink/50">
                    {[it.color, it.size].filter(Boolean).join(' / ')} × {it.quantity}
                  </p>
                </div>
                <p>{formatIDR(it.price * it.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between text-ink/60">
              <span>Subtotal</span>
              <span>{formatIDR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink/60">
              <span>Ongkos Kirim</span>
              <span>{formatIDR(SHIPPING_COST)}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-2 font-medium text-ink">
              <span>Total</span>
              <span>{formatIDR(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
