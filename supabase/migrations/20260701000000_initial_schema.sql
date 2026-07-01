-- Lab Stock — initial schema
-- See design doc Anexo (~/.gstack/projects/lab-stock/zeta-master-design-20260701-001736.md)
-- for the rationale behind each table and edge case.

-- Items del laboratorio
create table items (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  unidad text not null,
  stock_actual numeric not null default 0,
  stock_minimo numeric not null default 0,
  proveedor text,
  lead_time_dias int default 7,
  activo boolean default true,
  created_at timestamptz default now()
);

-- Movimientos de stock
create table movimientos (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references items(id) not null,
  tipo text not null check (tipo in ('uso', 'ingreso', 'ajuste')),
  cantidad numeric not null,
  usuario_id uuid references auth.users(id),
  nota text,
  created_at timestamptz default now()
);

-- Pedidos a proveedores
create table pedidos (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references items(id) not null,
  cantidad numeric not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'recibido', 'atrasado', 'cancelado')),
  fecha_pedido timestamptz default now(),
  fecha_estimada timestamptz,
  fecha_recibido timestamptz,
  usuario_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Perfiles de usuario
create table profiles (
  id uuid primary key references auth.users(id),
  nombre text not null,
  created_at timestamptz default now()
);

-- Vista: consumo promedio diario por item (últimos 30 días)
-- security_invoker: corre con los privilegios (y RLS) de quien consulta,
-- no del dueño de la vista — necesario para que RLS sobre `movimientos`
-- se respete también a través de esta vista.
create view consumo_promedio with (security_invoker = true) as
select
  item_id,
  abs(avg(cantidad)) as consumo_diario_promedio,
  count(*) as movimientos_mes
from movimientos
where tipo = 'uso'
  and created_at > now() - interval '30 days'
group by item_id;

-- Vista: stock crítico con días restantes estimados
create view stock_critico with (security_invoker = true) as
select
  i.id,
  i.nombre,
  i.unidad,
  i.stock_actual,
  i.stock_minimo,
  i.lead_time_dias,
  c.consumo_diario_promedio,
  case
    when c.consumo_diario_promedio > 0
    then round(i.stock_actual / c.consumo_diario_promedio)
    else null
  end as dias_restantes
from items i
left join consumo_promedio c on c.item_id = i.id
where i.activo = true;

-- Trigger: actualizar stock_actual en items al insertar movimiento (operación atómica)
--
--   registrarMovimiento(tipo, cantidad, item_id, nota)
--           │
--           ▼
--   INSERT INTO movimientos (...)
--           │
--           ▼ (trigger on_movimiento_insert, atómico)
--   tipo='uso'     → stock_actual -= cantidad
--   tipo='ingreso' → stock_actual += cantidad
--   tipo='ajuste'  → stock_actual  = cantidad
--
create or replace function actualizar_stock()
returns trigger as $$
begin
  if new.tipo = 'uso' then
    update items set stock_actual = stock_actual - new.cantidad where id = new.item_id;
  elsif new.tipo = 'ingreso' then
    update items set stock_actual = stock_actual + new.cantidad where id = new.item_id;
  elsif new.tipo = 'ajuste' then
    update items set stock_actual = new.cantidad where id = new.item_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_movimiento_insert
after insert on movimientos
for each row execute function actualizar_stock();

-- RLS: cualquier usuario autenticado puede leer/escribir cualquier tabla
-- (Premisa 4 del design doc — equipo de 3-5 personas de confianza, sin
-- control granular por rol para el MVP). Enable explícito, no dependemos
-- de la config "Automatic RLS" del dashboard de Supabase.

alter table items enable row level security;
alter table movimientos enable row level security;
alter table pedidos enable row level security;
alter table profiles enable row level security;

create policy "authenticated_full_access" on items
  for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on movimientos
  for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on pedidos
  for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on profiles
  for all to authenticated using (true) with check (true);
