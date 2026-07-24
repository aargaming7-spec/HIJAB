-- ============================================================
-- Alara — Supabase schema
-- Jalankan file ini di: Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- 1. Tabel produk
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  collection text,
  price numeric not null default 0,
  discount_price numeric,
  images text[] not null default '{}',
  colors text[] default '{}',
  sizes text[] default '{}',
  material text,
  description text,
  stock integer not null default 0,
  rating numeric default 0,
  is_best_seller boolean not null default false,
  is_new_arrival boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Aktifkan Row Level Security
alter table public.products enable row level security;

-- 3. Siapa saja (pengunjung website) boleh MEMBACA produk
create policy "Public can read products"
  on public.products
  for select
  using (true);

-- 4. Hanya user yang sudah login (admin) yang boleh insert/update/delete
create policy "Authenticated users can insert products"
  on public.products
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update products"
  on public.products
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete products"
  on public.products
  for delete
  to authenticated
  using (true);

-- ============================================================
-- 5. Buat akun admin
-- ============================================================
-- Jangan pakai "Sign Up" biasa dari website (belum kita buatkan).
-- Buat user admin lewat: Supabase Dashboard -> Authentication -> Users -> Add user
-- Isi email & password admin kamu di situ, itu yang dipakai login di /admin/login
