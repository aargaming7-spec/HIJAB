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

4. **Kelola katalog.** Buka `/#/admin/login` di website, login dengan akun admin yang dibuat di langkah 2. Dari dashboard admin kamu bisa menambah, mengedit, dan menghapus produk — perubahan langsung tersimpan di Supabase dan muncul di halaman Shop/Home. Kategori, koleksi, dan pilihan warna di halaman Shop otomatis ikut update sesuai data produk yang ada — tidak perlu diedit manual di kode.

## Setup Upload Foto Produk (Supabase Storage)

Supaya bisa upload foto langsung dari halaman Admin (bukan isi URL manual):

1. Buka Supabase Dashboard → **SQL Editor** → New query
2. Copy-paste isi file `supabase/storage_setup.sql`, lalu Run

Setelah itu, di form Tambah/Edit Produk akan ada tombol **Upload Foto** — pilih file dari komputer, otomatis ter-upload dan langsung terpasang ke produk. Bisa pilih beberapa foto sekaligus.

## Setup Kelola Konten (Hero, Banner, About, Contact)

Supaya teks & foto di Hero, Promotional Banner, halaman About, dan Contact bisa diubah dari Admin tanpa edit kode:

1. Buka Supabase Dashboard → **SQL Editor** → New query
2. Copy-paste isi file `supabase/site_settings_schema.sql`, lalu Run

Setelah itu buka `/#/admin` → tab **Konten**. Semua perubahan yang disimpan di situ langsung muncul di website publik. Selama belum diisi, website tetap tampil dengan teks default (tidak akan kosong/error).

## Setup Kelola Konten (Hero, Banner, About, Contact)

Supaya teks & foto di halaman Home (hero, promo banner), About, dan Contact bisa diubah dari Admin tanpa edit kode:

1. Buka Supabase Dashboard → **SQL Editor** → New query
2. Copy-paste isi file `supabase/site_settings_schema.sql`, lalu Run

Setelah itu buka `/#/admin` → tab **Konten** untuk mengubah teks hero, banner promo, halaman About, dan info Contact. Selama belum diisi, website tetap menampilkan konten default yang sudah ada.

Selama Supabase belum diisi, website tetap jalan normal memakai data contoh lokal, tapi fitur admin tidak aktif.

## Setup Checkout + Payment Gateway (Midtrans)

Fitur checkout butuh **Supabase Edge Functions** (kode server kecil yang menyimpan Server Key Midtrans dengan aman — tidak boleh ada di kode frontend). Ini beda dari deploy website biasa, perlu Supabase CLI.

### 1. Jalankan schema order
Supabase Dashboard → SQL Editor → jalankan isi `supabase/orders_schema.sql` (setelah `schema.sql` sudah dijalankan lebih dulu).

### 2. Install Supabase CLI
```bash
npm install -g supabase
```

### 3. Login & hubungkan ke project
```bash
supabase login
supabase link --project-ref glcguunpgoerxuqemzjj
```
(ganti `glcguunpgoerxuqemzjj` kalau project-ref kamu beda — lihat di URL dashboard Supabase kamu)

### 4. Set secret untuk Edge Functions
Ambil dari Midtrans Dashboard → Settings → Access Keys, dan Supabase Dashboard → Settings → API (untuk `service_role` key — **beda** dari anon key, jangan tertukar):

```bash
supabase secrets set MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxx
supabase secrets set MIDTRANS_IS_PRODUCTION=false
supabase secrets set SUPABASE_URL=https://glcguunpgoerxuqemzjj.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=isi-dengan-service-role-key
```

### 5. Deploy Edge Functions
```bash
supabase functions deploy create-transaction
supabase functions deploy midtrans-webhook
supabase functions deploy track-order
```

### 6. Daftarkan Webhook URL di Midtrans
Setelah deploy, kamu dapat URL seperti:
`https://glcguunpgoerxuqemzjj.supabase.co/functions/v1/midtrans-webhook`

Masukkan URL itu ke: Midtrans Dashboard → Settings → Configuration → **Payment Notification URL**.

### 7. Isi Client Key di frontend
Tambahkan ke `.env` (lokal) dan sebagai GitHub Secret (untuk deploy) — lihat `.env.example`:
```
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxx
VITE_MIDTRANS_IS_PRODUCTION=false
```

Setelah semua langkah ini selesai, checkout di website akan membuka popup pembayaran Midtrans (Snap), dan status pembayaran otomatis update begitu customer selesai bayar. Customer bisa cek status pesanan mereka di halaman `/track-order` dengan nomor pesanan + no HP.
