-- Follow-up to 20260701164049: the search_path='' fix left the function's
-- unqualified `items` reference unresolvable, since an empty search_path
-- means no schema is searched by default. Qualify with `public.` explicitly.

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
