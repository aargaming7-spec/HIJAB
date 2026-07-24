import { useState } from 'react'
import { callEdgeFunction } from '../lib/edgeFunctions.js'
import { formatIDR } from '../utils/format.js'

const statusLabel = {
  processing: 'Diproses',
  packed: 'Dikemas',
  shipped: 'Dikirim',
  delivered: 'Diterima',
  cancelled: 'Dibatalkan',
}

const paymentLabel = {
  pending: 'Menunggu Pembayaran',
  paid: 'Sudah Dibayar',
  failed: 'Gagal',
  expired: 'Kedaluwarsa',
}

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setOrder(null)
    setLoading(true)

    const { data, error } = await callEdgeFunction('track-order', { orderNumber, phone })
    setLoading(false)

    if (error) {
      setError(error)
      return
    }
    setOrder(data.order)
  }

  return (
    <div className="container-page py-10 md:py-16">
      <div className="mx-auto max-w-lg">
        <p className="eyebrow mb-2 text-center">Lacak Pesanan</p>
        <h1 className="mb-8 text-center font-display text-2xl md:text-3xl">Cek Status Pesanan</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Nomor pesanan (contoh: ALR-1721...)" className="input-field" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
          <input required placeholder="No. HP yang dipakai saat checkout" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Mencari...' : 'Lacak Pesanan'}
          </button>
        </form>

        {order && (
          <div className="mt-10 border border-line p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-medium">{order.order_number}</p>
              <span className="bg-mauve-100 px-2 py-1 text-xs text-mauve-700">{statusLabel[order.order_status] || order.order_status}</span>
            </div>
            <p className="mb-4 text-sm text-ink/60">Pembayaran: {paymentLabel[order.payment_status] || order.payment_status}</p>

            {order.tracking_number && (
              <p className="mb-4 text-sm text-ink/60">
                No. Resi: <span className="text-ink">{order.tracking_number}</span> {order.courier && `(${order.courier})`}
              </p>
            )}

            <div className="space-y-3 border-t border-line pt-4">
              {order.order_items?.map((it) => (
                <div key={it.id} className="flex items-center justify-between text-sm">
                  <span>
                    {it.product_name} × {it.quantity}
                  </span>
                  <span>{formatIDR(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between border-t border-line pt-4 font-medium">
              <span>Total</span>
              <span>{formatIDR(order.total)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
