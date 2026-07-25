-- ============================================================
-- Alara — Product Variants (stok per warna/ukuran)
-- Jalankan setelah schema.sql sudah ada.
-- Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- ============================================================

alter table public.products
  add column if not exists variants jsonb not null default '[]'::jsonb;

-- Struktur tiap item di dalam "variants":
-- { "color": "Black", "size": "M", "stock": 12 }
-- Kalau produk tidak punya ukuran (misal aksesoris), field "size" bisa null.
--
-- Kalau kolom "variants" kosong ([]), website akan tetap pakai kolom
-- "stock" lama sebagai jumlah stok umum (backward compatible) — jadi
-- produk lama yang belum diisi varian tidak akan rusak/hilang stoknya.
