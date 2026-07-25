-- ============================================================
-- Alara — Site Settings (kelola hero, banner, About, Contact dari Admin)
-- Jalankan di: Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

create table if not exists public.site_settings (
  id text primary key default 'main',
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

create policy "Authenticated can upsert site settings"
  on public.site_settings for insert
  to authenticated
  with check (true);

create policy "Authenticated can update site settings"
  on public.site_settings for update
  to authenticated
  using (true)
  with check (true);

-- Baris awal (kosong) supaya website bisa langsung baca tanpa error.
-- Isinya nanti diisi lewat halaman Admin -> tab Konten.
insert into public.site_settings (id, data)
values ('main', '{}')
on conflict (id) do nothing;
