import { useEffect, useState } from 'react'
import { X, Download, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { formatIDR } from '../utils/format.js'

const paymentLabel = {
  pending: 'Menunggu Pembayaran',
  paid: 'Sudah Dibayar',
  failed: 'Gagal',
  expired: 'Kedaluwarsa',
}

const paymentColor = {
  pending: 'bg-mist text-ink/60',
  paid: 'bg-mauve-100 text-mauve-700',
  failed: 'bg-red-50 text-red-600',
  expired: 'bg-red-50 text-red-600',
}

const orderStatusOptions = [
  { value: 'processing', label: 'Diproses' },
  { value: 'packed', label: 'Dikemas' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'delivered', label: 'Diterima' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')

  async function refresh() {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const filtered = orders.filter((o) => filter === 'all' || o.order_status === filter)

  function exportToCSV() {
    const headers = [
      'No. Pesanan',
      'Tanggal',
      'Nama Customer',
      'No. HP',
      'Email',
      'Alamat',
      'Kota',
      'Kode Pos',
      'Item',
      'Subtotal',
      'Ongkos Kirim',
      'Total',
      'Status Pembayaran',
      'Status Pesanan',
      'Kurir',
      'No. Resi',
      'Catatan',
    ]

    function escapeCSV(value) {
      const str = String(value ?? '')
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const rows = filtered.map((o) => {
      const itemsSummary = (o.order_items || [])
        .map((it) => `${it.product_name}${it.color ? ` (${[it.color, it.size].filter(Boolean).join('/')})` : ''} x${it.quantity}`)
        .join('; ')

      return [
        o.order_number,
        new Date(o.created_at).toLocaleString('id-ID'),
        o.customer_name,
        o.customer_phone,
        o.customer_email || '',
        o.shipping_address,
        o.city || '',
        o.postal_code || '',
        itemsSummary,
        o.subtotal,
        o.shipping_cost,
        o.total,
        paymentLabel[o.payment_status] || o.payment_status,
        orderStatusOptions.find((s) => s.value === o.order_status)?.label || o.order_status,
        o.courier || '',
        o.tracking_number || '',
        o.notes || '',
      ]
        .map(escapeCSV)
        .join(',')
    })

    // Tambah BOM (\ufeff) supaya Excel baca karakter Indonesia (é, dsb) dengan benar
    const csvContent = '\ufeff' + [headers.map(escapeCSV).join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateStr = new Date().toISOString().slice(0, 10)
    link.href = url
    link.download = `pesanan-alara-${dateStr}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleDelete(order) {
    const ok = window.confirm(
      `Hapus pesanan ${order.order_number}? Tindakan ini tidak bisa dibatalkan.`
    )
    if (!ok) return

    setSaving(true)
    // Hapus item pesanan dulu (foreign key ke orders), baru pesanannya.
    const { error: itemsError } = await supabase.from('order_items').delete().eq('order_id', order.id)
    if (itemsError) {
      setSaving(false)
      alert(itemsError.message)
      return
    }
    const { error } = await supabase.from('orders').delete().eq('id', order.id)
    setSaving(false)
    if (error) {
      alert(error.message)
      return
    }
    setSelected(null)
    await refresh()
  }

  async function handleUpdate(order, patch) {
    setSaving(true)
    const { error } = await supabase.from('orders').update(patch).eq('id', order.id)
    setSaving(false)
    if (error) {
      alert(error.message)
      return
    }
    await refresh()
    setSelected((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`border px-3 py-1.5 text-xs ${filter === 'all' ? 'border-ink bg-ink text-paper' : 'border-line text-ink/60'}`}
          >
            Semua ({orders.length})
          </button>
          {orderStatusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`border px-3 py-1.5 text-xs ${filter === opt.value ? 'border-ink bg-ink text-paper' : 'border-line text-ink/60'}`}
            >
              {opt.label} ({orders.filter((o) => o.order_status === opt.value).length})
            </button>
          ))}
        </div>

        <button
          onClick={exportToCSV}
          disabled={filtered.length === 0}
          className="btn-outline flex items-center gap-2 text-xs disabled:opacity-40"
        >
          <Download size={14} /> Export ke Excel ({filtered.length})
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-ink/50">Memuat pesanan...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink/50">Belum ada pesanan.</p>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line bg-mist text-left text-xs uppercase tracking-wide text-ink/50">
                <th className="px-4 py-3">No. Pesanan</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Pembayaran</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-3 font-medium">{o.order_number}</td>
                  <td className="px-4 py-3">
                    <p>{o.customer_name}</p>
                    <p className="text-xs text-ink/50">{o.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3">{formatIDR(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-[11px] ${paymentColor[o.payment_status] || 'bg-mist'}`}>
                      {paymentLabel[o.payment_status] || o.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink/60">
                    {orderStatusOptions.find((s) => s.value === o.order_status)?.label || o.order_status}
                  </td>
                  <td className="px-4 py-3 text-ink/50 text-xs">
                    {new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => setSelected(o)} className="text-xs text-mauve-600 underline underline-offset-4">
                        Detail
                      </button>
                      <button
                        onClick={() => handleDelete(o)}
                        aria-label="Hapus pesanan"
                        title="Hapus pesanan"
                        className="text-ink/40 hover:text-red-600 transition-colors duration-250"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-ink/40" onClick={() => setSelected(null)} aria-label="Tutup" />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto bg-paper p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg">{selected.order_number}</h2>
                <p className="text-xs text-ink/50">
                  {new Date(selected.created_at).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDelete(selected)}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 disabled:opacity-40"
                >
                  <Trash2 size={14} /> Hapus
                </button>
                <button onClick={() => setSelected(null)} aria-label="Tutup">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="mb-5 space-y-1 text-sm">
              <p className="font-medium">{selected.customer_name}</p>
              <p className="text-ink/60">{selected.customer_phone}</p>
              {selected.customer_email && <p className="text-ink/60">{selected.customer_email}</p>}
              <p className="text-ink/60">
                {selected.shipping_address}
                {selected.city && `, ${selected.city}`} {selected.postal_code}
              </p>
              {selected.notes && <p className="text-ink/50 italic">Catatan: {selected.notes}</p>}
            </div>

            <div className="mb-5 space-y-2 border-y border-line py-4">
              {selected.order_items?.map((it) => (
                <div key={it.id} className="flex items-center justify-between text-sm">
                  <span>
                    {it.product_name} {[it.color, it.size].filter(Boolean).length > 0 && `(${[it.color, it.size].filter(Boolean).join(' / ')})`} × {it.quantity}
                  </span>
                  <span>{formatIDR(it.price * it.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-sm text-ink/60">
                <span>Ongkos Kirim</span>
                <span>{formatIDR(selected.shipping_cost)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatIDR(selected.total)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-widest2 text-ink/50">Status Pembayaran</label>
                <select
                  className="input-field"
                  value={selected.payment_status}
                  onChange={(e) => handleUpdate(selected, { payment_status: e.target.value })}
                  disabled={saving}
                >
                  {Object.entries(paymentLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-widest2 text-ink/50">Status Pesanan</label>
                <select
                  className="input-field"
                  value={selected.order_status}
                  onChange={(e) => handleUpdate(selected, { order_status: e.target.value })}
                  disabled={saving}
                >
                  {orderStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-widest2 text-ink/50">Kurir</label>
                  <input
                    className="input-field"
                    defaultValue={selected.courier || ''}
                    placeholder="JNE, J&T, dll"
                    onBlur={(e) => handleUpdate(selected, { courier: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-widest2 text-ink/50">No. Resi</label>
                  <input
                    className="input-field"
                    defaultValue={selected.tracking_number || ''}
                    placeholder="Nomor resi"
                    onBlur={(e) => handleUpdate(selected, { tracking_number: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
