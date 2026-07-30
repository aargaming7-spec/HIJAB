-- ============================================================
-- Alara — Review & Rating dari customer
-- Jalankan setelah schema.sql sudah ada.
-- Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- ============================================================

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  rating smallint not null check (rating between 1 and 5),
  text text not null,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists reviews_product_id_idx on public.reviews(product_id);

alter table public.reviews enable row level security;

-- Siapa saja boleh membaca review yang sudah approved (default: langsung
-- tampil begitu dikirim; admin bisa sembunyikan/hapus review yang tidak
-- pantas lewat dashboard admin).
create policy "Public can read approved reviews"
  on public.reviews
  for select
  using (approved = true);

-- Siapa saja (customer, tanpa login) boleh mengirim review baru.
create policy "Public can submit reviews"
  on public.reviews
  for insert
  to anon, authenticated
  with check (
    char_length(name) between 1 and 60
    and char_length(text) between 1 and 1000
    and rating between 1 and 5
  );

-- Hanya admin (sudah login) yang boleh melihat semua review (termasuk yang
-- disembunyikan), mengubah status approved, atau menghapus review.
create policy "Authenticated users can read all reviews"
  on public.reviews
  for select
  to authenticated
  using (true);

create policy "Authenticated users can update reviews"
  on public.reviews
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete reviews"
  on public.reviews
  for delete
  to authenticated
  using (true);

-- ============================================================
-- Opsional: trigger supaya kolom products.rating otomatis ter-update
-- jadi rata-rata dari semua review approved tiap kali ada review baru/dihapus.
-- ============================================================
create or replace function public.update_product_rating()
returns trigger as $$
begin
  update public.products
  set rating = coalesce((
    select round(avg(rating)::numeric, 1)
    from public.reviews
    where product_id = coalesce(new.product_id, old.product_id)
      and approved = true
  ), 0)
  where id = coalesce(new.product_id, old.product_id);
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists reviews_after_change on public.reviews;
create trigger reviews_after_change
  after insert or update or delete on public.reviews
  for each row execute function public.update_product_rating();
