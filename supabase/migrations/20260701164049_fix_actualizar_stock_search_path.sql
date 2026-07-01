-- Fix: actualizar_stock() had a mutable search_path (flagged by Supabase
-- security advisors after applying the initial schema). Pin it explicitly
-- and qualify table references so the function can't be hijacked via
-- schema manipulation.

create or replace function actualizar_stock()
returns trigger as $$
begin
  if new.tipo = 'uso' then
    update public.items set stock_actual = stock_actual - new.cantidad where id = new.item_id;
  elsif new.tipo = 'ingreso' then
    update public.items set stock_actual = stock_actual + new.cantidad where id = new.item_id;
  elsif new.tipo = 'ajuste' then
    update public.items set stock_actual = new.cantidad where id = new.item_id;
  end if;
  return new;
end;
$$ language plpgsql set search_path = '';
