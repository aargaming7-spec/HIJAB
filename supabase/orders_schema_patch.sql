-- ============================================================
-- Patch: lengkapi policy order_items yang belum ada
-- (sebelumnya cuma ada INSERT untuk anon & SELECT untuk authenticated,
-- jadi admin belum bisa update/hapus baris order_items kalau suatu saat perlu)
-- Jalankan di Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- ============================================================

create policy "Authenticated can update order items"
  on public.order_items for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete order items"
  on public.order_items for delete
  to authenticated
  using (true);

-- Dibutuhkan supaya admin bisa hapus pesanan (tombol hapus di Admin Dashboard).
-- order_items ikut kehapus otomatis (kolom order_id sudah "on delete cascade"),
-- tapi tetap butuh policy delete di atas supaya cascade-nya tidak diblok RLS.
create policy "Authenticated can delete orders"
  on public.orders for delete
  to authenticated
  using (true);
