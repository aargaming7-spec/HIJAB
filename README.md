# Alara — Modest Fashion E-Commerce

Website e-commerce fashion/hijab yang modern, minimalis, dan premium. Dibangun dengan React + Vite + Tailwind CSS, sepenuhnya static dan siap di-host gratis di GitHub Pages.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Build production

```bash
npm run build
```

Hasil build ada di folder `dist/`.

## Deploy ke GitHub Pages

Repo ini sudah dilengkapi GitHub Actions workflow (`.github/workflows/deploy.yml`) yang otomatis build & deploy setiap ada push ke branch `main`.

Langkah setup di GitHub:

1. Push project ini ke repository GitHub.
2. Buka **Settings → Pages**.
3. Pada **Source**, pilih **GitHub Actions**.
4. Push ke `main` — workflow akan build dan men-deploy otomatis.
5. Website akan tersedia di `https://<username>.github.io/<repo>/`.

Project menggunakan `HashRouter` dan `base: './'` pada `vite.config.js`, sehingga routing tetap berfungsi normal (tidak 404) walau di-refresh dari path mana pun di GitHub Pages, tanpa perlu konfigurasi tambahan.

## Struktur project

```
src/
  assets/        gambar & aset statis
  components/    komponen UI (Navbar, Footer, ProductCard, dll)
  pages/         halaman (Home, Shop, ProductDetail, Cart, Wishlist, About, Contact)
  data/          data produk lokal (products.js)
  context/       React context (CartContext, WishlistContext)
  hooks/         custom hooks (useLocalStorage)
  utils/         helper functions (format harga, dll)
```

## Catatan

- Data produk masih menggunakan dummy (16 produk) di `src/data/products.js`, termasuk foto placeholder dari picsum.photos — ganti dengan foto produk asli di `src/assets/` sebelum production.
- Cart & Wishlist tersimpan di `localStorage`, jadi tetap ada setelah refresh browser.
- Tidak ada backend/API — semua state ada di sisi client.
