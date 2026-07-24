import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'

export default function OrderSuccess() {
  const [params] = useSearchParams()
  const orderNumber = params.get('order')
  const isDummy = params.get('dummy') === '1'

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <CheckCircle2 size={40} className="mb-4 text-mauve-600" />
      <p className="eyebrow mb-2">Terima Kasih</p>
      <h1 className="font-display text-2xl md:text-3xl">Pesanan kamu sudah kami terima</h1>
      {orderNumber && (
        <p className="mt-4 text-ink/60">
          Nomor pesanan: <span className="font-medium text-ink">{orderNumber}</span>
        </p>
      )}
      {isDummy && (
        <p className="mt-3 max-w-md border border-line bg-mist p-3 text-xs text-ink/60">
          Ini pesanan uji coba (payment gateway belum aktif). Data ini bisa kamu lihat & hapus dari
          Admin Dashboard.
        </p>
      )}
      <p className="mt-2 max-w-md text-sm text-ink/50">
        Simpan nomor pesanan ini untuk melacak status pengiriman kamu di halaman Lacak Pesanan.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/track-order" className="btn-outline">
          Lacak Pesanan
        </Link>
        <Link to="/shop" className="btn-primary">
          Lanjut Belanja
        </Link>
      </div>
    </div>
  )
}
