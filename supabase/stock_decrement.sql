-- ============================================================
-- Patch: kurangi stok produk otomatis saat pesanan dibuat (mode dummy)
-- Dipakai oleh Checkout.jsx lewat supabase.rpc('decrement_product_stock', ...)
--
-- Kenapa lewat function database, bukan update langsung dari frontend?
-- 1. Aman dari race condition — kalau 2 orang checkout produk yang sama
--    di saat bersamaan, "for update" mengunci baris supaya stok tidak
--    salah hitung (double-kurang / kurang duluan padahal stok sudah habis).
-- 2. Tidak perlu longgarkan izin UPDATE tabel products ke pengunjung biasa
--    (anon) — mereka cuma bisa panggil function ini, bukan update bebas.
-- 3. Kalau stok tidak cukup, item itu dilewati (tidak dikurangi jadi minus),
--    dan dikembalikan daftar item mana saja yang stoknya kurang.
--
-- Jalankan di Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================

-- Kolom "terjual" yang ditampilkan di katalog (mirip Shopee), otomatis
-- bertambah tiap ada pesanan masuk lewat function di bawah.
alter table public.products
  add column if not exists sold_count integer not null default 0;

-- Foto per warna: { "Black": ["url1","url2"], "Cream": ["url3"] }.
-- Kalau warna tertentu tidak punya foto sendiri, halaman produk otomatis
-- pakai foto umum (kolom "images") sebagai fallback.
alter table public.products
  add column if not exists color_images jsonb not null default '{}'::jsonb;

create or replace function public.decrement_product_stock(items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  product record;
  v jsonb;
  new_variants jsonb;
  v_stock int;
  item_qty int;
  item_ok boolean;
  insufficient jsonb := '[]'::jsonb;
begin
  for item in select * from jsonb_array_elements(items)
  loop
    if item->>'product_id' is null then
      continue;
    end if;

    select id, stock, variants into product
    from public.products
    where id = (item->>'product_id')::uuid
    for update;

    if not found then
      continue;
    end if;

    item_qty := coalesce((item->>'quantity')::int, 0);
    item_ok := true;

    if product.variants is not null and jsonb_array_length(product.variants) > 0 then
      new_variants := '[]'::jsonb;
      for v in select * from jsonb_array_elements(product.variants)
      loop
        if coalesce(v->>'color', '') = coalesce(item->>'color', '')
           and coalesce(v->>'size', '') = coalesce(item->>'size', '') then
          v_stock := coalesce((v->>'stock')::int, 0);
          if v_stock < item_qty then
            item_ok := false;
            insufficient := insufficient || jsonb_build_object(
              'product_id', item->>'product_id', 'color', item->>'color', 'size', item->>'size'
            );
          else
            v := jsonb_set(v, '{stock}', to_jsonb(v_stock - item_qty));
          end if;
        end if;
        new_variants := new_variants || v;
      end loop;

      update public.products
      set variants = new_variants,
          stock = (select coalesce(sum((vv->>'stock')::int), 0) from jsonb_array_elements(new_variants) vv),
          sold_count = sold_count + case when item_ok then item_qty else 0 end
      where id = product.id;
    else
      if product.stock < item_qty then
        insufficient := insufficient || jsonb_build_object('product_id', item->>'product_id');
      else
        update public.products set stock = stock - item_qty, sold_count = sold_count + item_qty where id = product.id;
      end if;
    end if;
  end loop;

  return insufficient;
end;
$$;

grant execute on function public.decrement_product_stock(jsonb) to anon, authenticated;
