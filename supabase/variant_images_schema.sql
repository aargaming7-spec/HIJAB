-- ============================================================
-- Alara — Multi-gambar per varian warna
-- Jalankan setelah schema.sql sudah ada.
-- Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- ============================================================

alter table public.products
  add column if not exists variant_images jsonb not null default '{}'::jsonb;

-- Struktur "variant_images": objek dengan key = nama warna, value = array URL foto.
-- Contoh:
-- {
--   "Dusty Rose": ["https://.../dusty-1.jpg", "https://.../dusty-2.jpg"],
--   "Sand": ["https://.../sand-1.jpg"]
-- }
--
-- Kalau warna tertentu TIDAK ada di variant_images (atau produk tidak punya
-- warna sama sekali), website otomatis pakai kolom "images" umum sebagai
-- fallback — jadi produk lama tetap tampil normal tanpa perlu diedit ulang.
