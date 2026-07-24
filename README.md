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

- Cart & Wishlist tersimpan di `localStorage`, jadi tetap ada setelah refresh browser.
- Kalau Supabase belum dikonfigurasi, website otomatis pakai data dummy di `src/data/products.js` sebagai fallback.

## Setup Supabase (database produk + admin login)

1. **Buat tabel produk.** Buka Supabase Dashboard → SQL Editor → New query, lalu jalankan isi file `supabase/schema.sql` di repo ini. Ini akan membuat tabel `products` beserta aturan keamanan (Row Level Security): siapa saja boleh membaca produk, tapi hanya user yang login yang boleh menambah/mengubah/menghapus.

2. **Buat akun admin.** Buka Supabase Dashboard → Authentication → Users → Add user. Isi email & password — ini yang dipakai untuk login di halaman `/admin/login`. (Jangan pakai form sign-up dari website, karena memang sengaja tidak dibuatkan — supaya hanya kamu yang bisa jadi admin.)

3. **Isi kredensial di project.**
   - Untuk development lokal: copy `.env.example` menjadi `.env`, isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` (ambil dari Supabase Dashboard → Settings → API, bagian **Project URL** dan **anon public key**).
   - Untuk deploy GitHub Pages: buka repo di GitHub → Settings → Secrets and variables → Actions → New repository secret. Tambahkan dua secret: `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`. Workflow deploy sudah dikonfigurasi untuk otomatis memakainya saat build.

4. **Kelola katalog.** Buka `/#/admin/login` di website, login dengan akun admin yang dibuat di langkah 2. Dari dashboard admin kamu bisa menambah, mengedit, dan menghapus produk — perubahan langsung tersimpan di Supabase dan muncul di halaman Shop/Home.

Selama Supabase belum diisi, website tetap jalan normal memakai data contoh lokal, tapi fitur admin tidak aktif.
