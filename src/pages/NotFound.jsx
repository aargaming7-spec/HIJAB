import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow mb-3">404</p>
      <h1 className="font-display text-3xl md:text-4xl">Halaman tidak ditemukan</h1>
      <p className="mt-4 max-w-md text-ink/60">
        Halaman yang kamu cari mungkin sudah dipindahkan atau tidak tersedia.
      </p>
      <Link to="/" className="btn-primary mt-8">
        Kembali ke Beranda
      </Link>
    </div>
  )
}
