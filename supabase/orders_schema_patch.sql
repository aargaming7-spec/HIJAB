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
