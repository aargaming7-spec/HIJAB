-- ============================================================
-- Alara — Storage setup (upload foto produk dari Admin)
-- Jalankan di: Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- 1. Buat bucket "products" untuk simpan foto produk (public supaya
--    fotonya bisa langsung ditampilkan di website tanpa perlu sign-in)
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- 2. Siapa saja boleh MELIHAT foto (supaya foto muncul di website)
create policy "Public can view product photos"
  on storage.objects for select
  using (bucket_id = 'products');

-- 3. Hanya admin (yang sudah login) yang boleh UPLOAD foto
create policy "Authenticated can upload product photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products');

-- 4. Hanya admin yang boleh HAPUS foto
create policy "Authenticated can delete product photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'products');
