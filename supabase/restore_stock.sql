-- ============================================================
-- Patch: kembalikan stok & "terjual" kalau pesanan dibatalkan / dihapus
--
-- Sebelumnya: stok berkurang & terjual bertambah pas pesanan dibuat,
-- tapi kalau pesanannya batal/gagal atau dihapus admin, angkanya
-- kebawa terus (nggak balik ke semula). Ini yang diperbaiki di sini.
--
-- Cara kerja: 1 kolom penanda (stock_restored) ditambahin ke orders,
-- supaya restore-nya cuma jalan SEKALI per pesanan — jadi aman walau
-- misal pesanan dibatalkan dulu baru dihapus (nggak dobel restore).
--
-- Jalankan di Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================

alter table public.orders
  add column if not exists stock_restored boolean not null default false;

create or replace function public.restore_order_stock(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  already_restored boolean;
  it record;
  product record;
  v jsonb;
  new_variants jsonb;
  v_stock int;
  matched boolean;
begin
  select stock_restored into already_restored from public.orders where id = p_order_id for update;

  -- Kalau order sudah tidak ada (sudah dihapus lebih dulu) atau sudah pernah
  -- di-restore sebelumnya, tidak usah diulang.
  if already_restored is null or already_restored = true then
    return;
  end if;

  for it in
    select product_id, color, size, quantity
    from public.order_items
    where order_id = p_order_id and product_id is not null
  loop
    select id, stock, variants into product
    from public.products
    where id = it.product_id
    for update;

    if not found then
      continue;
    end if;

    if product.variants is not null and jsonb_array_length(product.variants) > 0 then
      new_variants := '[]'::jsonb;
      matched := false;
      for v in select * from jsonb_array_elements(product.variants)
      loop
        if coalesce(v->>'color', '') = coalesce(it.color, '')
           and coalesce(v->>'size', '') = coalesce(it.size, '') then
          v_stock := coalesce((v->>'stock')::int, 0);
          v := jsonb_set(v, '{stock}', to_jsonb(v_stock + it.quantity));
          matched := true;
        end if;
        new_variants := new_variants || v;
      end loop;

      update public.products
      set variants = new_variants,
          stock = (select coalesce(sum((vv->>'stock')::int), 0) from jsonb_array_elements(new_variants) vv),
          sold_count = greatest(0, sold_count - case when matched then it.quantity else 0 end)
      where id = product.id;
    else
      update public.products
      set stock = stock + it.quantity,
          sold_count = greatest(0, sold_count - it.quantity)
      where id = product.id;
    end if;
  end loop;

  update public.orders set stock_restored = true where id = p_order_id;
end;
$$;

grant execute on function public.restore_order_stock(uuid) to authenticated;
