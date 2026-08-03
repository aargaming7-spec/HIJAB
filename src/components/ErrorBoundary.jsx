import { Component } from 'react'

// Kalau ada bug tak terduga di mana pun di aplikasi (bukan cuma pencarian),
// ini mencegah seluruh halaman jadi putih kosong tanpa penjelasan. Alih-alih
// crash total, pengguna lihat pesan singkat dan bisa muat ulang halaman.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Terjadi error tak terduga:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="font-display text-2xl">Ada yang salah</p>
          <p className="max-w-sm text-sm text-ink/60">
            Terjadi kesalahan tak terduga di halaman ini. Coba muat ulang halaman.
          </p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Muat Ulang
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
