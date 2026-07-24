-- ============================================================
-- Alara — Orders schema (checkout + tracking)
-- Jalankan setelah schema.sql (tabel products harus sudah ada).
-- Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- ============================================================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,      -- nomor pesanan yang ditampilkan ke customer, misal ALR-20260725-0001
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  shipping_address text not null,
  city text,
  postal_code text,
  notes text,
  subtotal numeric not null default 0,
  shipping_cost numeric not null default 0,
  total numeric not null default 0,
  payment_status text not null default 'pending', -- pending | paid | failed | expired
  order_status text not null default 'processing', -- processing | packed | shipped | delivered | cancelled
  midtrans_order_id text,
  midtrans_transaction_id text,
  tracking_number text,
  courier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  product_image text,
  color text,
  size text,
  price numeric not null,
  quantity integer not null,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Siapa saja boleh MEMBUAT order (checkout dari website publik)
create policy "Anyone can create an order"
  on public.orders for insert
  to anon
  with check (true);

create policy "Anyone can add order items"
  on public.order_items for insert
  to anon
  with check (true);

-- Untuk lacak pesanan: pengunjung boleh baca order MEREKA SENDIRI
-- via order_number + no HP yang mereka input sendiri (dicek di aplikasi,
-- bukan di database, supaya tetap simpel). Baca tetap dibatasi hanya
-- lewat Edge Function get-order agar order_number tidak bisa ditebak-tebak.
-- Admin (authenticated) boleh baca & ubah semua order.
create policy "Authenticated can read all orders"
  on public.orders for select
  to authenticated
  using (true);

create policy "Authenticated can update orders"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can read all order items"
  on public.order_items for select
  to authenticated
  using (true);

-- Index untuk pencarian nomor pesanan saat lacak paket
create index if not exists idx_orders_order_number on public.orders(order_number);
